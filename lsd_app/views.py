from django.contrib import messages
from django.shortcuts import render, HttpResponse
from django.core.files.storage import FileSystemStorage
import os
from django.conf import settings
# Create your views here.
from lsd_app.forms import UserRegistrationForm
from .models import UserRegistrationModel

def UserRegisterActions(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            print('Data is Valid')
            form.save()
            messages.success(request, 'You have been successfully registered')
            form = UserRegistrationForm()
            return render(request, 'UserRegistrations.html', {'form': form})
        else:
            messages.success(request, 'Email or Mobile Already Existed')
            print("Invalid form")
    else:
        form = UserRegistrationForm()
    return render(request, 'UserRegistrations.html', {'form': form})


def UserLoginCheck(request):
    if request.method == "POST":
        loginid = request.POST.get('loginid')
        pswd = request.POST.get('pswd')
        print("Login ID = ", loginid, ' Password = ', pswd)
        try:
            check = UserRegistrationModel.objects.get(loginid=loginid, password=pswd)
            status = check.status
            print('Status is = ', status)
            if status == "activated":
                request.session['id'] = check.id
                request.session['loggeduser'] = check.name
                request.session['loginid'] = loginid
                request.session['email'] = check.email
                print("User id At", check.id, status)
                return render(request, 'users/UserHomePage.html', {})
            else:
                messages.success(request, 'Your Account Not at activated')
                return render(request, 'UserLogin.html')
        except Exception as e:
            print('Exception is ', str(e))
            pass
        messages.success(request, 'Invalid Login id and password')
    return render(request, 'UserLogin.html', {})


def UserHome(request):
    return render(request, 'users/UserHomePage.html', {})


import os
import cv2
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
import seaborn as sns
from django.shortcuts import render
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.vgg16 import preprocess_input
from tensorflow.keras.utils import to_categorical
from sklearn.metrics import confusion_matrix, roc_curve, auc
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import PredictionResultSerializer
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, decode_predictions, preprocess_input as mobilenet_preprocess

model = None
verifier_model = None

def get_model():
    global model
    if model is None:
        if os.path.exists("model.keras"):
            model = load_model("model.keras")
        else:
            raise FileNotFoundError("model.keras not found")
    return model

def get_verifier():
    global verifier_model
    if verifier_model is None:
        verifier_model = MobileNetV2(weights='imagenet')
    return verifier_model

CATTLE_KEYWORDS = [
    'ox', 'bull', 'cow', 'water_buffalo', 'bison', 'bovine', 'calf'
]

CLASS_NAMES = ['Normal', 'Lumpy']

# Dummy history object (replace with actual history from training)
class DummyHistory:
    def __init__(self):
        self.history = {
            'accuracy': [0.1, 0.2, 0.3, 0.4, 0.5],
            'val_accuracy': [0.2, 0.3, 0.4, 0.5, 0.6],
            'loss': [0.9, 0.8, 0.7, 0.6, 0.5],
            'val_loss': [0.8, 0.7, 0.6, 0.5, 0.4]
        }

history = DummyHistory()

# Generate plots outside the index function
plt.plot(history.history['accuracy'], label='Training Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.title('Model Accuracy over Epochs')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()
plt.savefig(os.path.join(settings.BASE_DIR, 'static', 'plots', 'accuracy.png'))
plt.close()

plt.plot(history.history['loss'], label='Training Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Model Loss over Epochs')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.savefig(os.path.join(settings.BASE_DIR, 'static', 'plots', 'loss.png'))
plt.close()

# ROC Curve (using dummy data)
y_score = [0.1, 0.2, 0.3, 0.4, 0.5]  # Dummy y_score
fpr, tpr, _ = roc_curve([0, 0, 1, 1, 1], [0.1, 0.2, 0.3, 0.4, 0.5])  # Dummy y_true
roc_auc = auc(fpr, tpr)
plt.plot(fpr, tpr, label=f"AUC = {roc_auc:.2f}")
plt.plot([0, 1], [0, 1], 'k--')
plt.title('ROC Curve')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.legend(loc='lower right')
plt.savefig(os.path.join(settings.BASE_DIR, 'static', 'plots', 'roc_curve.png'))
plt.close()

# Class Distribution (using dummy data)
sns.countplot(x=[0, 0, 1, 1, 1]) # Dummy y
plt.xticks([0, 1], ['Normal', 'Lumpy'])
plt.title('Class Distribution in Dataset')
plt.savefig(os.path.join(settings.BASE_DIR, 'static', 'plots', 'class_distribution.png'))
plt.close()

def verify_is_cattle(img_path):
    """Checks if the uploaded image contains cattle using MobileNetV2."""
    try:
        if not os.path.exists(img_path):
            print(f"Image path does not exist: {img_path}")
            return False
            
        img = cv2.imread(img_path)
        if img is None:
            print(f"Could not read image: {img_path}")
            return False
            
        img_resized = cv2.resize(img, (224, 224))
        # Preprocess for MobileNetV2
        x = mobilenet_preprocess(np.expand_dims(img_resized, axis=0))
        preds = get_verifier().predict(x)
        decoded = decode_predictions(preds, top=5)[0]
        
        # Check if any of the top 5 predictions are cattle-related
        is_cattle = False
        for _, label, score in decoded:
            label_lower = label.lower()
            if any(k in label_lower for k in CATTLE_KEYWORDS):
                if score > 0.05: # At least 5% confidence for cattle keywords
                    print(f"Cattle detected: {label} with confidence {score:.2f}")
                    is_cattle = True
                    break
        
        if not is_cattle:
            print(f"No cattle detected. Top predictions: {[d[1] for d in decoded]}")
            
        return is_cattle
    except Exception as e:
        print(f"Verification error: {e}")
        # Return False to be safe, requiring valid cattle detection
        return False

def predict_image(img_path):
    img = cv2.imread(img_path)
    img = cv2.resize(img, (224, 224))
    img = preprocess_input(np.expand_dims(img, axis=0))
    preds = get_model().predict(img)
    return preds[0], CLASS_NAMES[np.argmax(preds)]


def index1(request):
    if request.method == "POST" and request.FILES["image"]:
        img = request.FILES["image"]
        fs = FileSystemStorage()
        filename = fs.save(img.name, img)
        img_path = fs.path(filename)

        # Check if the image is actually cattle
        if not verify_is_cattle(img_path):
            return render(request, "users/index.html", {
                "error": "The uploaded image does not appear to be cattle. Please upload a clear image of a cow or bull."
            })

        preds, label = predict_image(img_path)

        # Confusion matrix dummy plot (replace with real test data in practice)
        cm = confusion_matrix([0, 1], [0, 1])  # dummy example
        sns.heatmap(cm, annot=True)
        plt.savefig(os.path.join(settings.BASE_DIR, 'static', 'plots', 'confusion_matrix.png'))
        plt.close()

        return render(request, "users/result.html", {
            "label": label,
            "probabilities": zip(CLASS_NAMES, preds),
            "image_url": fs.url(filename),
            "confusion_matrix": "/static/plots/confusion_matrix.png"
        })
    return render(request, "users/index.html")

# Confusion matrix dummy plot (replace with real test data in practice)
cm = confusion_matrix([0, 1], [0, 1])  # dummy example
sns.heatmap(cm, annot=True)
plt.savefig(os.path.join(settings.BASE_DIR, 'static', 'plots', 'confusion_matrix.png'))
plt.close()

@api_view(['POST'])
def predict_api(request):
    if request.method == 'POST' and request.FILES.get('file'):
        image = request.FILES['file']
        fs = FileSystemStorage()
        filename = fs.save(image.name, image)
        image_path = fs.path(filename)
        
        # Check if the image is actually cattle
        if not verify_is_cattle(image_path):
            return Response({
                'result': 'Invalid Image',
                'detail': 'The uploaded image does not appear to be cattle. Please upload a clear image of a cow or bull.',
                'confidence': 0.0
            }, status=status.HTTP_400_BAD_REQUEST)
            
        preds, label = predict_image(image_path)
        confidence = float(preds[np.argmax(preds)])  # Get confidence
        serializer = PredictionResultSerializer(data={'result': label, 'confidence': confidence})
        if serializer.is_valid():
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_api(request):
    loginid = request.data.get('loginid')
    password = request.data.get('password')
    try:
        user = UserRegistrationModel.objects.get(loginid=loginid, password=password)
        if user.status == "activated":
            return Response({'message': 'Login successful', 'name': user.name}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Your account is not activated yet. Please wait for admin approval.'}, status=status.HTTP_401_UNAUTHORIZED)
    except UserRegistrationModel.DoesNotExist:
        return Response({'detail': 'Invalid Login ID or password'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def admin_login_api(request):
    loginid = request.data.get('loginid')
    password = request.data.get('password')
    # Use the same hardcoded credentials as the PC admin login
    if loginid == 'admin' and password == 'admin':
        return Response({'message': 'Admin Login successful', 'name': 'Administrator', 'isAdmin': True}, status=status.HTTP_200_OK)
    else:
        return Response({'detail': 'Invalid Admin credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def list_users_api(request):
    users = UserRegistrationModel.objects.all().values('id', 'name', 'loginid', 'email', 'mobile', 'status')
    return Response(list(users), status=status.HTTP_200_OK)


@api_view(['POST'])
def activate_user_api(request):
    user_id = request.data.get('id')
    try:
        UserRegistrationModel.objects.filter(id=user_id).update(status='activated')
        return Response({'message': 'User activated successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def register_api(request):
    data = request.data
    try:
        UserRegistrationModel.objects.create(
            name=data.get('name'),
            loginid=data.get('loginid'),
            password=data.get('password'),
            mobile=data.get('mobile'),
            email=data.get('email'),
            locality=data.get('locality'),
            address=data.get('address'),
            city=data.get('city'),
            state=data.get('state'),
            status='pending'  # Set to pending by default
        )
        return Response({'message': 'Registration successful. Waiting for admin activation.'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'detail': f'Registration failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


def EDA(request):
    return render(request, "users/eda.html", {})