from django.urls import path
from .views import RegisterView, ProfileView, ChangePasswordView, UserListView, CustomLoginView
from .otp_auth import SendOTPView, VerifyOTPView

urlpatterns = [
    path('', UserListView.as_view(), name='user-list'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomLoginView.as_view(), name='custom-login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
]
