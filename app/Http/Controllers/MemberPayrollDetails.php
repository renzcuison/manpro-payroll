<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MemberPayrollDetails extends Controller
{
    public function getMemberPayrollRecord()
    {
        if (Auth::check()) {
            $userID = Auth::id(); // Get the user ID of the authenticated user
        }
        $payrollRecord = DB::table('hr_payroll_allrecords')
            ->select('*')
            ->where('emp_id', $userID)
            ->where('payroll_status', 1)
            ->get();

        $recordData = [];
        foreach ($payrollRecord as $record) {
            $userRecord = DB::table('user')
                ->select(DB::raw("
                        user.user_id,
                        user.fname,
                        user.mname,
                        user.lname,
                        user.profile_pic,
                        user.department,
                        user.user_type,
                        user.hourly_rate,
                        user.daily_rate,
                        user.monthly_rate,
                        user.work_days,
                        user.category"))
                ->where('user_id', $record->emp_id)
                ->where('is_deleted', '=', 0)
                ->get();

            foreach ($userRecord as $user) {

                $recordData[] = [
                    'user_type' => $user->user_type,
                    'user_id' => $user->user_id,
                    'fname' => $user->fname,
                    'mname' => $user->mname,
                    'lname' => $user->lname,
                    'profile_pic' => $user->profile_pic,
                    'department' => $user->department,
                    'category' => $user->category,
                    'basic_pay' => $record->basic_pay,
                    'monthly_rate' => $record->monthly_rate,
                    'hourly_rate' => $record->hourly_rate,
                    'daily_rate' => $record->daily_rate,
                    'payroll_id' => $record->payroll_id,
                    'signature' => $record->signature,
                    'payroll_fromdate' => $record->payroll_fromdate,
                    'payroll_todate' => $record->payroll_todate,
                    'payroll_cutoff' => $record->payroll_cutoff,
                    'payroll_status' => $record->payroll_status,
                    'workdays' => $record->workdays,
                    'processtype' => $record->processtype,
                    'total_contribution' => $record->total_contribution,
                    'total_deduction' => $record->total_deduction,
                    'net_pay' => $record->net_pay,
                    'remaining_loan' => $record->remaining_loan,
                ];
            }
        }

        return response()->json(['recordData' => $recordData]);
    }

    public function updateSignature(Request $request)
    {
        if (Auth::check()) {
            $userID = Auth::id(); // Get the user ID of the authenticated user
        }
        $validated = $request->validate([
            'signature' => 'required|file|mimes:pdf,docx,jpg,jpeg,png'
        ]);
        if ($validated) {
            $dataToUpdate = [
                'signature' => $request->file('signature'),
            ];

            if ($request->hasFile('signature')) {
                $path = $request->file('signature')->store('public');

                $filename = basename($path);
                $dataToUpdate['signature'] = $filename;
            }

            try {
                DB::table('hr_payroll_allrecords')
                    ->where('emp_id', $userID)
                    ->where('payroll_status', 1)
                    ->update($dataToUpdate);
            } catch (\Exception $e) {
            }
        }


        return response()->json([
            'status' => 200,
            'data' => $validated
        ]);
    }
}
