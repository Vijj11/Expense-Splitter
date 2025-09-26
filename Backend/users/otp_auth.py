from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import random

User = get_user_model()

class SendOTPView(APIView):
    def post(self, request):
        phone = request.data.get('phone')
        otp = '123456'  # Static OTP for testing
        cache.set(f'otp_{phone}', otp, timeout=300)
        # SMS integration removed; just return success
        return Response({'message': 'OTP sent'}, status=status.HTTP_200_OK)

class VerifyOTPView(APIView):
    def post(self, request):
        phone = request.data.get('phone')
        otp = request.data.get('otp')
        cached_otp = cache.get(f'otp_{phone}')
        if otp == cached_otp:
            user, created = User.objects.get_or_create(username=phone, defaults={'phone': phone})
            refresh = RefreshToken.for_user(user)
            return Response({'access': str(refresh.access_token)}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
