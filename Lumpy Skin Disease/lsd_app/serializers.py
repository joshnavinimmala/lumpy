from rest_framework import serializers

class PredictionResultSerializer(serializers.Serializer):
    result = serializers.CharField()
    confidence = serializers.FloatField()
