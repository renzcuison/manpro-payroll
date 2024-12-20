<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HrAttendance;
use App\Models\HrApplications;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class MobileAppController extends Controller
{
    public function submitVerificationCode(Request $request)
    {
        log::info("submitVerificationCode()");
        try {
            $validator = $request->validate([
                'verify_code' => 'required|string',
            ]);

            $user = Auth::user();
            $user = DB::table('user')->where('user_id', $user->user_id)->first();

            if ($user && $user->where('verify_code', $validator['verify_code'])->first()) {

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

    public function attendance()
    {
        try {
            $user = Auth::user();
            $attendance = HRAttendance::where('user_id', $user->user_id)->get();

            return response(['attendance' => $attendance, 200]);
        } catch (\Exception $e) {
            return response(
                [
                    'error' => 'An error occurred',
                    'message' => $e->getMessage(),
                ],
                500,
            );
        }
    }

    public function applications()
    {
        try {
            $user = Auth::user();
            $applications = HrApplications::where('hr_applications.user_id', $user->user_id)
                ->where('hr_applications.is_deleted', 0)
                ->join('hr_application_status', 'hr_applications.app_status_id', '=', 'hr_application_status.app_status_id')
                ->select('hr_applications.*', 'hr_application_status.color', 'hr_application_status.app_status_name')
                ->get();

            if ($applications) {
                return response()->json([
                    'applications' => $applications,
                ], 200);
            } else {
                return response()->json([
                    'message' => 'No applications found',
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
