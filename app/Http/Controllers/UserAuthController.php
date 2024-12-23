<?php

namespace App\Http\Controllers;

use Exception;

use App\Models\User;
use App\Models\UsersModel;
use App\Models\UserIpModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserAuthController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $user->id = $user->user_id;
        // if (!Storage::disk('public')->exists($user->profile_pic)) {
        //     $user->profile_pic = null;
        // }
        $user->token = $request->bearerToken();
        return [
            'user' => $user
        ];
    }

    public function checkUser(Request $request)
    {
        log::info("UserAuthController::checkUser");

        $fields = $request->validate([ 'user' => 'required|string', 'pass' => 'required|string' ]);

        $user = UsersModel::where('user_name', '=', $fields['user'])->orWhere('email', '=', $fields['user'])->first();

        log::info($user);

        $user->password = Hash::make('Admin@123');
        $user->save();

        if ($user && Hash::check($request->input('pass'), $user->password)) {
            log::info("Valid User");
            return response()->json([ 'success' => 1, 'user' => $user->id, 'email' => $user->email]);
        } else {
            log::info("Invalid User");
            return response()->json([ 'success' => 0 ]);
        }
    }

    public function signup(Request $request)
    {
        $fields = $request->validate([
            'firstname' => 'required|string',
            'lastname' => 'required|string',
            'birthdate' => 'required|string',
            'email' => 'required|string|unique:user,email',
            'contact_number' => 'required|string',
            'address' => 'required|string',
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $arrX = array("#AD0000", "#AD0046", "#AD006F", "#AD00A1", "#9000AD", "#5600AD", "#0015AD", "#005FAD", "#0088AD", "#00ADA9", "#00AD67", "#00AD1D", "#6FAD00", "#A9AD00", "#AD9000", "#AD5F00", "#AD2500", "#5C797C", "#39595C", "#14292C");

        $fields['user_color'] = $arrX[array_rand($arrX)];
        $fields['date_created'] = date("Y-m-d h:i:s");

        $user = User::create($fields);

        if ($user) {
            $user->token = $user->createToken('contactAppToken')->plainTextToken;
            $user->id = $user->user_id;

            $response = [
                'success' => 1,
                'user' => $user
            ];
            return response($response, 201);
        }

        return response([
            "success" => 0
        ], 200);
    }

    public function login(Request $request)
    {
        log::info("UserAuthController::login");

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

    public function logout()
    {
        log::info("UserAuthController::logout");

        if (Auth::check()) {
            $userID = Auth::id();
        }

        $user = User::where('user_id', $userID)->first();
        $user->tokens()->delete();

        // auth()->user()->tokens()->delete();

        // log::info(User::where('user_id', $userID)->first());
        
        return [
            'message' => 'Logged out'
        ];
    }

    protected function getUserDetailsById($user_id)
    {
        $user_details = User::find($user_id);
    }
}
