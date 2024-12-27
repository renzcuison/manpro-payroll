<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class MemberSettingsController extends Controller
{
    public function updateProfile(Request $request)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        }

        $validated = $request->validate([
            'fname' => 'required',
            'mname' => 'required',
            'lname' => 'required',
            'bdate' => 'required',
            'email' => 'required',
            'contact' => 'required',
            'address' => 'required'
        ]);

        if ($validated) {
            $dataToUpdate = [
                'fname' => $request->input('fname'),
                'mname' => $request->input('mname'),
                'lname' => $request->input('lname'),
                'bdate' => $request->input('bdate'),
                'email' => $request->input('email'),
                'contact_number' => $request->input('contact'),
                'address' => $request->input('address'),
            ];

            try {
                DB::table('user')->where('user_id', $userID)->update($dataToUpdate);
            } catch (\Exception $e) {
            }
        }


        return response()->json([ 'status' => 200, 'data' => $validated ]);
    }

    public function getUserData()
    {
        if (Auth::check()) {
            $userID = Auth::id();
        }

        $userData = DB::table('user')->select('*')->where('user_id', $userID)->first();
        $user = [];

        if ($userData) {
            $user[] = [
                'fname' => $userData->fname,
                'mname' => $userData->mname,
                'lname' => $userData->lname,
                'bdate' => $userData->bdate,
                'email' => $userData->email,
                'contact' => $userData->contact_number,
                'address' => $userData->address,
            ];
        }

        return response()->json(['user' => $user]);
    }

    public function updatePicture(Request $request)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        }

        $validated = $request->validate([ 'profile_pic' => 'required|file' ]);

        if ($validated) {
            $dataToUpdate = [ 'profile_pic' => $request->file('profile_pic') ];

            if ($request->hasFile('profile_pic')) {
                $path = $request->file('profile_pic')->store('public');

                $filename = basename($path);
                $dataToUpdate['profile_pic'] = $filename;
            }

            try {
                DB::table('user')->where('user_id', $userID)->update($dataToUpdate);
            } catch (\Exception $e) {
            }
        }

        return response()->json([ 'status' => 200, 'data' => $validated ]);
    }

    public function changePassword(Request $request)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        }

        $user = User::find($userID);

        $validated = $request->validate([
            'current' => 'required|string',
            'new' => 'required|string',
            'confirm' => 'required|string'
        ]);

        if ($validated) {
            $current = $validated['current'];
            $new = $validated['new'];
            $confirm = $validated['confirm'];

            if ($validated && Hash::check($request->input('current'), $user->password)) {
                if ($request->input('new') === $request->input('confirm')) {
                    try {
                        $updatePass = DB::table('user')
                            ->where('user_id', $userID)
                            ->update(['password' => Hash::make($request->input('new'))]);

                        return response()->json([ 'status' => 200, 'message' => 'Password changed successfully' ]);
                    } catch (\Exception $e) {
                        return response()->json([ 'status' => 500, 'message' => 'Failed to update password' ]);
                    }
                } else {
                    return response()->json([ 'status' => 400, 'message' => 'New and confirm new passwords do not match' ]);
                }
            } else {
                return response()->json([ 'status' => 400, 'message' => 'Current password is incorrect' ]);
            }
        }
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required',
            'current' => 'required|string',
            'new' => 'required|string',
            'confirm' => 'required|string',
            'email' => 'required|string'
        ]);

        if ($validated) {
            $user_id = $validated['user_id'];
            $current = $validated['current'];
            $new = $validated['new'];
            $confirm = $validated['confirm'];
            $email = $validated['email'];

            $user = User::find($request->input('user_id'));

            if ($validated && ($request->input('current') === $user->password)) {
                if ($request->input('new') === $request->input('confirm')) {
                    try {
                        $updatePass = DB::table('user')
                            ->where('user_id', $request->input('user_id'))
                            ->update(['password' => Hash::make($request->input('new'))]);

                        return response()->json([ 'status' => 200, 'message' => 'Success' ]);
                    } catch (\Exception $e) {
                        return response()->json([ 'status' => 500, 'message' => 'Failed to reset password' ]);
                    }
                } else {
                    return response()->json([ 'status' => 400, 'message' => 'New and confirm new passwords do not match' ]);
                }
            }
        }
    }
}
