<?php

namespace App\Http\Controllers\Desktop;

use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DesktopController extends Controller
{
    public function getEmployees()
    {
        log::info("DesktopController::getEmployees");
        
        // if (Auth::check()) {
            // $userID = Auth::id();
        // } else {
            // $userID = null;
        // }

        $userID = 357;
        
        $user = User::findOrFail($userID);

        log::info($user);

        $employees = User::where('team', $user->team)
            ->where('is_deleted', 0)
            ->where('status', '!=', 'Resigned')
            ->select('user_id', 'fname', 'mname', 'lname', 'email', 'user_type')
            ->get();

        return response()->json([ 'status' => 200, 'employees' => $employees ]);
    }
}
