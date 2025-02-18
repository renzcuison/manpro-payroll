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
