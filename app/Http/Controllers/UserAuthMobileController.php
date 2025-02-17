<?php

namespace App\Http\Controllers;

use Exception;

use App\Models\UsersModel;
use App\Models\UserIpModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserAuthMobileController extends Controller
{
    public function checkUser(Request $request)
    {
        Log::info("UserAuthMobileController::checkUser");

        $fields = $request->validate([ 'user' => 'required|string', 'pass' => 'required|string' ]);

        $user = UsersModel::where('user_name', '=', $fields['user'])->orWhere('email', '=', $fields['user'])->first();

        if ($user && Hash::check($request->input('pass'), $user->password)) {
            Log::info("Valid User");
            return response()->json([ 'success' => 1, 'user' => $user->id, 'email' => $user->email]);
        } else {
            Log::info("Invalid User");
            return response()->json([ 'success' => 0, 'message' => "User Does Not Exist" ]);
        }
    }

    public function verifyCode(Request $request, $id)
    {
        log::info("UserAuthMobileController::verifyCode " . $id);
        
        try {
            $code = $this->generateRandomCode(8);

            log::info("Code: " . $code);

            log::info("1");
            $userInsert = UsersModel::find($id);
            $userInsert->verify_code = $code;
            $userInsert->is_verified = 0;
            $userInsert->save();
            // Query the database to retrieve user data
            $user = DB::table('users')->select('email', 'first_name', 'last_name', 'user_name')->where('id', $id)->first();

            if ($user) {
                $fullname = $user->first_name . ' ' . $user->last_name;
                $company = "ManPro";
                $username = $user->user_name;
                $email = $user->email;

                $details = [
                    'name' => $fullname,
                    'company' => $company,
                    'username' => $username,
                    'verifyCode' => $code,
                ];

                Log::info("Sending email to $email");

                Mail::to($email)->send(new VerifyCodeMail($details));

                // Log successful email sending
                Log::info("Login Verification Email sent successfully to $email");

                return response()->json([ 'status' => 200, 'userData' => 'Success', 'code' => "Email"]);
                
            } else {
                return response()->json([ 'status' => 404, 'userData' => 'User not found', ]);
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

    public function login(Request $request)
    {
        log::info("UserAuthMobileController::login");

        $fields = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
            'passcode' => 'required|string'
        ]);

        $user = UsersModel::where(function ($query)
        
        use ($fields) {
            $query->where('user_name', '=', $fields['username'])->orWhere('email', '=', $fields['username']);
        })->first();

        if ($user && Hash::check($request->input('password'), $user->password) && $user->verify_code === $request->input('passcode')) {
            $user->token = $user->createToken('userAppToken')->plainTextToken;
            $user->id    = $user->user_id;

            return response(['success' => 1,'user' => $user], 200);
        } else {
            return response(["error" => "Wrong Username or Password"]);
        }
    }
}
