<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class HrProfileController extends Controller
{
    public function getUserData($id)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $userTeam = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $id)
            ->where('team', $userTeam->team)
            ->first();

        $employee = DB::table('user')
            ->select(DB::raw('*'))
            ->where('user_id', $user->user_id)
            ->get();

        $payslip = DB::table('hr_payroll_allrecords')
            ->select(DB::raw('*'))
            ->where('emp_id', $user->user_id)
            ->where('signature', '!=', null)
            ->where('is_deleted', 0)
            ->get();

        $present = DB::table('hr_attendance')
            ->select(DB::raw('*'))
            ->where('user_id', $user->user_id)
            ->where('is_deleted', 0)
            ->get();

        $application = DB::table('hr_applications')
            ->select(DB::raw('*'))
            ->where('user_id', $user->user_id)
            ->where('is_deleted', 0)
            ->get();

        $userData = array();
        foreach ($employee as $emp) {
            $userData[] = $emp;
        }

        $monthToday = date('m');
        $yearToday = date('Y');

        $calendarEvents = DB::table('hr_workdays')
            ->select(DB::raw("
                hr_workdays.workday_id,
                hr_workdays.title,
                hr_workdays.start_date,
                hr_workdays.end_date,
                hr_workdays.color"))
            ->where('is_deleted', '=', 0)
            ->where('type', 1)
            ->where('team', $userTeam->team)
            ->whereRaw('MONTH(start_date) = ?', $monthToday)
            ->whereRaw('YEAR(start_date) = ?', $yearToday)
            ->get();

        return response()->json([
            'status' => 200,
            'userData' => $userData[0],
            'payslip' => count($payslip),
            'present' => count($present),
            'application' => count($application),
            'workdays' => count($calendarEvents),
        ]);
    }

    public function getPayrollHistory($empID)
    {
        $employee_id = $empID;

        $userTeam = DB::table('user')
            ->select('*')
            ->where('user_id', $employee_id)
            ->first();

        $payrollData = DB::table('hr_payroll_allrecords')
            ->select('hr_payroll_allrecords.*', 'user.*', 'hr_payroll_allrecords.monthly_rate', 'hr_payroll_allrecords.daily_rate', 'hr_payroll_allrecords.hourly_rate')
            ->join('user', 'user.user_id', '=', 'hr_payroll_allrecords.emp_id')
            ->where('hr_payroll_allrecords.emp_id', $employee_id)
            ->get();


        $payrollhistory = array();
        foreach ($payrollData as $payroll) {
            $payrollhistory[] = $payroll;
        }

        $payroll_remainingLoans = DB::table('hr_employee_benefits')
            ->select('amountTotal', 'amount')
            ->where('emp_id', '=', $employee_id)
            ->where('type', 2)
            ->where('team', $userTeam->team)
            ->where('is_deleted', 0)
            ->get();

        $sumAmountTotal = 0;

        foreach ($payroll_remainingLoans as $loan) {
            $sumAmountTotal += $loan->amountTotal;
        }

        return response()->json([
            'status' => 200,
            'payrollHistory' => $payrollhistory,
            'remainingLoan' => $payroll_remainingLoans ? $sumAmountTotal : 0
        ]);
    }

    public function getLoanData($id)
    {
        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $userTeam = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $loanDetails = DB::table('hr_employee_benefits')
            ->select(DB::raw('*'))
            ->where('emp_id', $id)
            ->where('type', 2)
            ->where('team', $userTeam->team)
            ->where('is_deleted', 0)
            ->get();

        return response()->json([
            'status' => 200,
            'loanData' => $loanDetails
        ]);
    }
}
