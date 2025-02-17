<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\ForgotPasswordMail;

class AuthMobileController extends Controller
{
    public function verifyCode(Request $request)
    {
        Log::info("AuthMobileController::verifyCode");

        try {
            $validator = $request->validate([
                'verify_code' => 'required|string',
            ]);

            $user = Auth::user(); // Get the authenticated user using the Auth facade

            if (!$user) {
                return response()->json([
                    'error' => 'User not authenticated'
                ], 401);
            }

            Log::info("User ID: " . $user->id);

            if ($user->verify_code === $validator['verify_code']) {
                return response()->json([
                    'message' => 'Logged in',
                    'verify_code' => $user->verify_code
                ], 200);
            } else {
                return response()->json([
                    'message' => 'Invalid Verification code'
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function logout()
    {
        try {
            $user = Auth::user();
            $user->tokens()->delete();

            return response()->json(
                ['message' => 'Logged out'],
                200
            );
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function verifyEmail(Request $request)
    {  
        Log::info("Verifying email: ");
        $fields = $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $fields['email'])->first();

        return response([
            "message" => $user ? 'Success' : '',
            "user_id" => $user ? $user->user_id : '',
            "pass" => $user ? $user->password : '',
        ], 200);
    }

    public function forgotPasswordMail(Request $request, $id)
    {
        $link = $request->validate([
            'linkValue' => 'nullable'
        ]);
        try {
            $user = User::select('email', 'fname', 'lname', 'team', 'username')
                ->where('is_deleted', 0)
                ->where('user_id', $id)
                ->first();

            if ($user) {
                $fullname = $user->fname . ' ' . $user->lname;
                $email = $user->email;

                $details = [
                    'name' => $fullname,
                    'company' => $user->team,
                    'username' => $user->username,
                    'linkValue' => $link['linkValue'],
                ];

                Mail::to($email)->send(new ForgotPasswordMail($details));

                Log::info("Email sent successfully to $email");

                return response()->json([
                    'status' => 200,
                    'userData' => 'Success',
                ]);
            } else {
                return response()->json([
                    'status' => 404, // Not Found
                    'userData' => 'User not found',
                ]);
            }
        } catch (\Exception $e) {
            // Log the exception for debugging
            Log::error("Error sending email: " . $e->getMessage());

            return response()->json([
                'status' => 500,
                'userData' => 'Server error',
            ]);
        }
    }
}
