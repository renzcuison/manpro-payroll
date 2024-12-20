<?php

namespace App\Http\Controllers;

use App\Models\HrPayrollBenefit;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class HrPayrollSummaryController extends Controller
{
    public function getPayrollSummary($dates)
    {
        log::info("HrPayrollSummaryController::getPayrollSummary 1");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $userTeam = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $recordsDate = explode(",", $dates);
        $cutoff = $recordsDate[0];
        $monthRecord = $recordsDate[1];
        $yearRecord = $recordsDate[2];
        $userRecord_payroll = array();
        $test = array();

        if ($userTeam->user_type === 'Super Admin') {
            $users = DB::table('user')
                ->select(DB::raw("
                    user.user_id,
                    user.fname,
                    user.mname,
                    user.lname,
                    user.monthly_rate,
                    user.daily_rate,
                    user.hourly_rate"
                ))
                ->where('is_deleted', '=', 0)
                ->orderBy('lname', 'asc')
                ->orderBy('fname', 'asc')
                ->orderBy('mname', 'asc')
                ->get();
        } else {
            $users = DB::table('user')
                ->select(DB::raw("
                    user.user_id,
                    user.fname,
                    user.mname,
                    user.lname,
                    user.monthly_rate,
                    user.daily_rate,
                    user.hourly_rate"
                ))
                ->where('is_deleted', '=', 0)
                ->where('team', '=', $userTeam->team)
                ->orderBy('lname', 'asc')
                ->orderBy('fname', 'asc')
                ->orderBy('mname', 'asc')
                ->get();
        }

        $total_monthly = 0;
        $total_ot = 0;
        $total_incentive = 0;
        $total_allowance = 0;
        $total_absences = 0;
        $total_tardiness = 0;
        $total_undertime = 0;
        $total_gross = 0;
        $total_sss_emps = 0;
        $total_sss_empr = 0;
        $total_phil_emps = 0;
        $total_phil_empr = 0;
        $total_pgbig_emps = 0;
        $total_pgbig_empr = 0;
        $total_insurance_emps = 0;
        $total_insurance_empr = 0;
        $total_tax = 0;
        $total_cash_advance = 0;
        $total_loan = 0;
        $total_advance_deduct = 0;
        $total_all_deduct = 0;
        $total_all_pay = 0;
        $total_bonus = 0;

        $total_monthly_added = 0;
        $total_ot_added = 0;
        $total_incentive_added = 0;
        $total_allowance_added = 0;
        $total_absences_added = 0;
        $total_tardiness_added = 0;
        $total_undertime_added = 0;
        $total_gross_added = 0;
        $total_sss_emps_added  = 0;
        $total_sss_empr_added  = 0;
        $total_phil_emps_added = 0;
        $total_phil_empr_added  = 0;
        $total_pgbig_emps_added  = 0;
        $total_pgbig_empr_added  = 0;
        $total_insurance_emps_added = 0;
        $total_insurance_empr_added = 0;
        $total_tax_added = 0;
        $total_cash_advance_added  = 0;
        $total_loan_added  = 0;
        $total_advance_deduct_added  = 0;
        $total_all_deduct_added  = 0;
        $total_all_pay_added  = 0;
        $total_bonus_added  = 0;

        $payroll_fromdate = "";
        $payroll_fromdate_added = "";
        $payroll_todate = "";
        $payroll_todate_added = "";

        $summaryAddedData = DB::table('hr_payroll_allrecords')
            ->select(
                'hr_payroll_allrecords.payroll_id',
                'hr_payroll_allrecords.processtype',
                'hr_payroll_allrecords.payroll_fromdate',
                'hr_payroll_allrecords.payroll_todate',
                'hr_payroll_allrecords.fname',
                'hr_payroll_allrecords.mname',
                'hr_payroll_allrecords.lname',
                'hr_payroll_allrecords.basic_pay',
                'hr_payroll_allrecords.monthly_rate',
                'hr_payroll_allrecords.daily_rate',
                'hr_payroll_allrecords.hourly_rate',
                'hr_payroll_allrecords.total_deduction',
                'hr_payroll_allrecords.overtime_hours',
                'hr_payroll_allrecords.overtime',
                'hr_payroll_allrecords.total_earnings',
                'hr_payroll_allrecords.total_gross',
                'hr_payroll_allrecords.net_pay',
                'hr_payroll_allrecords.incentives',
                'hr_payroll_allrecords.allowance',
                'hr_payroll_allrecords.absences',
                'hr_payroll_allrecords.tardiness',
                'hr_payroll_allrecords.undertime'
            )
            ->where('hr_payroll_allrecords.payroll_cutoff', '=', $cutoff)
            ->where('hr_payroll_allrecords.processtype', '=', 4)
            ->where('hr_payroll_allrecords.is_deleted', 0)
            ->whereRaw('MONTH(hr_payroll_allrecords.payroll_todate) = ?', [$monthRecord])
            ->whereRaw('YEAR(hr_payroll_allrecords.payroll_fromdate) = ?', [$yearRecord])
            ->orderBy('hr_payroll_allrecords.payroll_fromdate', 'asc')
            ->get();

        foreach ($users as $user) {
            $payroll_id = '';
            $processtype = '';
            $sss_employee = 0;
            $sss_employers = 0;
            $phil_employee = 0;
            $phil_employers = 0;
            $pbg_employee = 0;
            $pbg_employers = 0;
            $insure_employee = 0;
            $insure_employers = 0;
            $tax = 0;
            $taxable = 0;
            $exempt = 0;
            $adv_amountTotal = 0;
            $loan = 0;
            $advance = 0;
            $total_deduction = 0;
            $overtime_hours = 0;
            $overtime = 0;
            $earnings = 0;
            $net_pay = 0;
            $incentives = 0;
            $allowance = 0;
            $absences = 0;
            $tardiness = 0;
            $undertime = 0;
            $total_deduction = 0;
            $payroll_id = 0;
            $processtype = 0;
            $app_hours = 0;
            $bonus = 0;

            $payrollList = DB::table('hr_payroll_allrecords')
                ->select(
                    'hr_payroll_allrecords.payroll_id',
                    'hr_payroll_allrecords.processtype',
                    'hr_payroll_allrecords.payroll_fromdate',
                    'hr_payroll_allrecords.payroll_todate',
                    'hr_payroll_allrecords.fname',
                    'hr_payroll_allrecords.mname',
                    'hr_payroll_allrecords.lname',
                    'hr_payroll_allrecords.basic_pay',
                    'hr_payroll_allrecords.monthly_rate',
                    'hr_payroll_allrecords.daily_rate',
                    'hr_payroll_allrecords.hourly_rate',
                    'hr_payroll_allrecords.total_deduction',
                    'hr_payroll_allrecords.overtime_hours',
                    'hr_payroll_allrecords.overtime',
                    'hr_payroll_allrecords.total_earnings',
                    'hr_payroll_allrecords.total_gross',
                    'hr_payroll_allrecords.net_pay',
                    'hr_payroll_allrecords.incentives',
                    'hr_payroll_allrecords.allowance',
                    'hr_payroll_allrecords.absences',
                    'hr_payroll_allrecords.tardiness',
                    'hr_payroll_allrecords.undertime',
                    'hr_payroll_benefits.totalAmount',
                    'hr_payroll_benefits.type',
                    'hr_payroll_benefits.taxable',
                    'hr_payroll_benefits.exempt',
                    'hr_payroll_benefits.amountTotal',
                    'hr_employee_benefits_list.title'
                )
                ->join('hr_payroll_benefits', 'hr_payroll_benefits.payroll_id', '=', 'hr_payroll_allrecords.payroll_id')
                ->join('hr_employee_benefits_list', 'hr_employee_benefits_list.benefitlist_id', '=', 'hr_payroll_benefits.benefitlist_id')
                ->where('hr_payroll_allrecords.payroll_cutoff', '=', $cutoff)
                ->where('hr_payroll_allrecords.emp_id', '=', $user->user_id)
                ->where('hr_payroll_allrecords.is_deleted', 0)
                ->whereRaw('MONTH(hr_payroll_allrecords.payroll_todate) = ?', [$monthRecord])
                ->whereRaw('YEAR(hr_payroll_allrecords.payroll_fromdate) = ?', [$yearRecord])
                ->orderBy('hr_payroll_allrecords.payroll_fromdate', 'asc')
                ->get();

            if (!empty($payrollList)) {
                foreach ($payrollList as $payroll) {
                    $payroll_fromdate = $payroll->payroll_fromdate;
                    $payroll_todate = $payroll->payroll_todate;
                    $total_deduction = $payroll->total_deduction;
                    $payroll_id = $payroll->payroll_id;
                    $processtype = $payroll->processtype;
                    $overtime_hours = $payroll->overtime_hours;
                    $overtime = $payroll->overtime;
                    $earnings = $payroll->total_gross;
                    // $net_pay = $payroll->net_pay;
                    $net_pay = $payroll->net_pay - $payroll->tardiness;
                    $incentives = $payroll->incentives;
                    $allowance = $payroll->allowance;
                    $absences = $payroll->absences;
                    $tardiness = $payroll->tardiness;
                    $undertime = $payroll->undertime;

                    if ( $user->user_id == 372 ) {
                        log::info( "net_pay: " . $net_pay );
                    }

                    if ($payroll->type == 1) {
                        if ($payroll->title == 'SSS') {
                            $sss_employers = $payroll->totalAmount;
                        }
                        if ($payroll->title == 'PHILHEALTH') {
                            $phil_employers = $payroll->totalAmount;
                        }
                        if ($payroll->title == 'PAGIBIG') {
                            $pbg_employers = $payroll->totalAmount;
                        }
                        if ($payroll->title == 'INSURANCE') {
                            $insure_employers = $payroll->totalAmount;
                        }
                    }
                    if ($payroll->type == 2) {
                        if (strpos($payroll->title, 'Advance') !== false) {
                            $advance += $payroll->totalAmount;
                            $adv_amountTotal += $payroll->amountTotal;
                        } else {
                            $loan += $payroll->totalAmount;
                        }
                    }
                    if ($payroll->type == 3) {
                        if ($payroll->title == 'SSS') {
                            $sss_employee = $payroll->totalAmount;
                        }
                        if ($payroll->title == 'PHILHEALTH') {
                            $phil_employee = $payroll->totalAmount;
                        }
                        if ($payroll->title == 'PAGIBIG') {
                            $pbg_employee = $payroll->totalAmount;
                        }
                        if ($payroll->title == 'INSURANCE') {
                            $insure_employee = $payroll->totalAmount;
                        }
                    }
                    if ($payroll->type == 4) {
                        $tax = $payroll->totalAmount;
                        $taxable = $payroll->taxable;
                        $exempt = $payroll->exempt;
                    }

                    $dayFrom = date('d', strtotime($payroll_fromdate));
                    $dayTo = date('d', strtotime($payroll_todate));

                    $appList = DB::table('hr_applications')
                        ->select(DB::raw('*'), DB::raw('SUM(app_hours) as totalAppHours'))
                        ->where('user_id', '=', $user->user_id)
                        ->where('status', '=', 'Approved')
                        ->where('is_deleted', '=', 0)
                        ->whereRaw('(DAY(date_from) BETWEEN ? AND ?)', [$dayFrom, $dayTo])
                        ->whereRaw('MONTH(date_from) = ?', [$monthRecord])
                        ->whereRaw('YEAR(date_from) = ?', [$yearRecord])
                        ->orderBy('date_from', 'asc')
                        ->get();

                    $app_hours = $appList[0]->totalAppHours ? $appList[0]->totalAppHours : 0;
                }

                $payrollBonus = DB::table('hr_payroll_allrecords')
                    ->select(DB::raw('*'), DB::raw('SUM(total_gross) as totalBonus'))
                    ->where('emp_id', '=', $user->user_id)
                    ->where('is_deleted', 0)
                    ->whereBetween('payroll_todate', ["{$yearRecord}-01-01", "{$yearRecord}-12-31"])
                    ->orderBy('payroll_todate', 'asc')
                    ->get();

                $bonus = $payrollBonus[0]->totalBonus ? $payrollBonus[0]->totalBonus : 0;

                if (count($payrollList) != 0) {
                    $total_monthly += $payroll->basic_pay;
                    $total_ot += $overtime;
                    $total_incentive += $incentives;
                    $total_allowance += $allowance;
                    $total_absences += $absences;
                    $total_tardiness += $tardiness;
                    $total_undertime += $undertime;
                    $total_gross += $earnings;
                    $total_sss_emps += $sss_employee;
                    $total_sss_empr += $sss_employers;
                    $total_phil_emps += $phil_employee;
                    $total_phil_empr += $phil_employers;
                    $total_pgbig_emps += $pbg_employee;
                    $total_pgbig_empr += $pbg_employers;
                    $total_insurance_emps += $insure_employee;
                    $total_insurance_empr += $insure_employers;
                    $total_tax += $tax;
                    $total_cash_advance += $adv_amountTotal;
                    $total_loan += $loan;
                    $total_advance_deduct += $advance;
                    $total_all_deduct += $total_deduction;
                    $total_all_pay += $net_pay;
                    $total_bonus += $bonus / 12;

                    $userRecord_payroll[] = [
                        'payroll_id' => $payroll_id,
                        'processtype' => $processtype,
                        'user_id' => $user->user_id,
                        'fname' => $user->fname,
                        'mname' => $user->mname,
                        'lname' => $user->lname,
                        'monthly_rate' => $payroll->basic_pay,
                        'daily_rate' => $payroll->daily_rate,
                        'hourly_rate' => $payroll->hourly_rate,
                        'sss_employee' => $sss_employee,
                        'sss_employers' => $sss_employers,
                        'phil_employee' => $phil_employee,
                        'phil_employers' => $phil_employers,
                        'pbg_employee' => $pbg_employee,
                        'pbg_employers' => $pbg_employers,
                        'insure_employee' => $insure_employee,
                        'insure_employers' => $insure_employers,
                        'tax' => $tax,
                        'taxable' => $taxable,
                        'exempt' => $exempt,
                        'amountTotal' => $adv_amountTotal ? $adv_amountTotal : 0,
                        'loan' => $loan ? $loan : 0,
                        'advance' => $advance ? $advance : 0,
                        'total_deduction' => $total_deduction,
                        'net_pay' => $net_pay,
                        'hours' => 120,
                        'ot_hours' => $overtime_hours,
                        'ot_pay' => $overtime,
                        'earnings' => $earnings,
                        'incentives' => $incentives,
                        'allowance' => $allowance,
                        'absences' => $absences,
                        'tardiness' => $tardiness,
                        'undertime' => $undertime,
                        'bonus' => $monthRecord === '12' ? ($bonus / 12) : 0
                    ];
                }
            } else {
                $userRecord_payroll[] = [
                    'payroll_id' => '',
                    'processtype' => '',
                    'user_id' => '',
                    'fname' => '',
                    'mname' => '',
                    'lname' => '',
                    'monthly_rate' => '',
                    'daily_rate' => '',
                    'hourly_rate' => '',
                    'sss_employee' => '',
                    'sss_employers' => '',
                    'phil_employee' => '',
                    'phil_employers' => '',
                    'pbg_employee' => '',
                    'pbg_employers' => '',
                    'insure_employee' => '',
                    'insure_employers' => '',
                    'tax' => '',
                    'taxable' => '',
                    'exempt' => '',
                    'amountTotal' => '',
                    'loan' => '',
                    'advance' => '',
                    'total_deduction' => '',
                    'net_pay' => '',
                    'hours' => '',
                    'ot_hours' => '',
                    'ot_pay' => '',
                    'earnings' => '',
                    'incentives' => '',
                    'allowance' => '',
                    'absences' => '',
                    'tardiness' => '',
                    'undertime' => '',
                    'bonus' => ''
                ];
            }
        }

        if (!empty($summaryAddedData)) {
            foreach ($summaryAddedData as $summarydata) {
                $sss_employee_added = 0;
                $sss_employers_added = 0;
                $phil_employee_added = 0;
                $phil_employers_added = 0;
                $pbg_employee_added = 0;
                $pbg_employers_added = 0;
                $insure_employee_added = 0;
                $insure_employers_added = 0;
                $tax_added = 0;
                $taxable_added = 0;
                $exempt_added = 0;
                $adv_amountTotal_added = 0;
                $loan_added = 0;
                $advance_added = 0;
                $total_deduction_added = 0;
                $overtime_hours_added = 0;
                $overtime_added = 0;
                $earnings_added = 0;
                $net_pay_added = 0;
                $incentives_added = 0;
                $allowance_added = 0;
                $absences_added = 0;
                $tardiness_added = 0;
                $undertime_added = 0;
                $app_hours_added = 0;
                $bonus_added = 0;
                $summaryAddedBenefits = DB::table('hr_payroll_benefits')
                    ->select(
                        'hr_payroll_benefits.totalAmount',
                        'hr_payroll_benefits.type',
                        'hr_payroll_benefits.taxable',
                        'hr_payroll_benefits.exempt',
                        'hr_payroll_benefits.amountTotal',
                        'hr_payroll_benefits.list_name'
                    )
                    ->where('hr_payroll_benefits.payroll_id', '=', $summarydata->payroll_id)
                    ->where('hr_payroll_benefits.is_deleted', 0)
                    ->get();

                foreach ($summaryAddedBenefits as $summarybenefits) {
                    $payroll_fromdate_added = $summarydata->payroll_fromdate;
                    $payroll_todate_added = $summarydata->payroll_todate;
                    $total_deduction_added = $summarydata->total_deduction;
                    $overtime_hours_added  = $summarydata->overtime_hours;
                    $overtime_added  = $summarydata->overtime;
                    $earnings_added  = $summarydata->total_gross;
                    $net_pay_added  = $summarydata->net_pay;
                    $incentives_added  = $summarydata->incentives;
                    $allowance_added  = $summarydata->allowance;
                    $absences_added  = $summarydata->absences;
                    $tardiness_added  = $summarydata->tardiness;
                    $undertime_added  = $summarydata->undertime;

                    if ($summarybenefits->type == 1) {
                        if ($summarybenefits->list_name == 'SSS') {
                            $sss_employers_added = $summarybenefits->totalAmount;
                        }
                        if ($summarybenefits->list_name == 'PHILHEALTH') {
                            $phil_employers_added = $summarybenefits->totalAmount;
                        }
                        if ($summarybenefits->list_name == 'PAGIBIG') {
                            $pbg_employers_added = $summarybenefits->totalAmount;
                        }
                        if ($summarybenefits->list_name == 'INSURANCE') {
                            $insure_employers_added = $summarybenefits->totalAmount;
                        }
                    }
                    if ($summarybenefits->type == 2) {
                        if (strpos($summarybenefits->list_name, 'Advance') !== false) {
                            $advance_added += $summarybenefits->totalAmount;
                            $adv_amountTotal_added += $summarybenefits->amountTotal;
                        } else {
                            $loan_added += $summarybenefits->totalAmount;
                        }
                    }
                    if ($summarybenefits->type == 3) {
                        if ($summarybenefits->list_name == 'SSS') {
                            $sss_employee_added = $summarybenefits->totalAmount;
                        }
                        if ($summarybenefits->list_name == 'PHILHEALTH') {
                            $phil_employee_added = $summarybenefits->totalAmount;
                        }
                        if ($summarybenefits->list_name == 'PAGIBIG') {
                            $pbg_employee_added = $summarybenefits->totalAmount;
                        }
                        if ($summarybenefits->list_name == 'INSURANCE') {
                            $insure_employee_added = $summarybenefits->totalAmount;
                        }
                    }
                    if ($summarybenefits->type == 4) {
                        $tax_added = $summarybenefits->totalAmount;
                        $taxable_added = $summarybenefits->taxable;
                        $exempt_added = $summarybenefits->exempt;
                    }

                    $dayFrom_added = date('d', strtotime($payroll_fromdate_added));
                    $dayTo_added = date('d', strtotime($payroll_todate_added));

                    $appList = DB::table('hr_applications')
                        ->select(DB::raw('*'), DB::raw('SUM(app_hours) as totalAppHours'))
                        ->where('user_id', '=', $user->user_id)
                        ->where('status', '=', 'Approved')
                        ->where('is_deleted', '=', 0)
                        ->whereRaw('(DAY(date_from) BETWEEN ? AND ?)', [$dayFrom_added, $dayTo_added])
                        ->whereRaw('MONTH(date_from) = ?', [$monthRecord])
                        ->whereRaw('YEAR(date_from) = ?', [$yearRecord])
                        ->orderBy('date_from', 'asc')
                        ->get();

                    $app_hours_added = $appList[0]->totalAppHours ? $appList[0]->totalAppHours : 0;
                }

                $payrollBonusAdded = DB::table('hr_payroll_allrecords')
                    ->select(DB::raw('*'), DB::raw('SUM(total_gross) as totalBonus'))
                    ->where('emp_id', '=', $user->user_id)
                    ->where('is_deleted', 0)
                    ->whereBetween('payroll_todate', ["{$yearRecord}-01-01", "{$yearRecord}-12-31"])
                    ->orderBy('payroll_todate', 'asc')
                    ->get();

                $bonus_added = $payrollBonusAdded[0]->totalBonus ? $payrollBonusAdded[0]->totalBonus : 0;

                if (count($summaryAddedData) != 0) {
                    $total_monthly_added   += $summarydata->basic_pay;
                    $total_ot_added += $overtime_added;
                    $total_incentive_added += $incentives_added;
                    $total_allowance_added += $allowance_added;
                    $total_absences_added += $absences_added;
                    $total_tardiness_added += $tardiness_added;
                    $total_undertime_added += $undertime_added;
                    $total_gross_added += $earnings_added;
                    $total_sss_emps_added   += $sss_employee_added;
                    $total_sss_empr_added   += $sss_employers_added;
                    $total_phil_emps_added  += $phil_employee_added;
                    $total_phil_empr_added  += $phil_employers_added;
                    $total_pgbig_emps_added    += $pbg_employee_added;
                    $total_pgbig_empr_added   += $pbg_employers_added;
                    $total_insurance_emps_added += $insure_employee_added;
                    $total_insurance_empr_added += $insure_employers_added;
                    $total_tax_added += $tax_added;
                    $total_cash_advance_added  += $adv_amountTotal_added;
                    $total_loan_added  += $loan_added;
                    $total_advance_deduct_added  += $advance_added;
                    $total_all_deduct_added   += $total_deduction_added;
                    $total_all_pay_added     += $net_pay_added;
                    $total_bonus_added     += $bonus_added / 12;

                    log::info("Net Pay Added: " . $net_pay_added);

                    array_push($userRecord_payroll, [
                        'payroll_id' => $summarydata->payroll_id,
                        'processtype' => $summarydata->processtype,
                        'user_id' => null,
                        'fname' => $summarydata->fname,
                        'mname' => $summarydata->mname,
                        'lname' => $summarydata->lname,
                        'monthly_rate' => $summarydata->basic_pay,
                        'daily_rate' => $summarydata->daily_rate,
                        'hourly_rate' => $summarydata->hourly_rate,
                        'sss_employee' => $sss_employee_added,
                        'sss_employers' => $sss_employers_added,
                        'phil_employee' => $phil_employee_added,
                        'phil_employers' => $phil_employers_added,
                        'pbg_employee' => $pbg_employee_added,
                        'pbg_employers' => $pbg_employers_added,
                        'insure_employee' => $insure_employee_added,
                        'insure_employers' => $insure_employers_added,
                        'tax' => $tax_added,
                        'taxable' => $taxable_added,
                        'exempt' => $exempt_added,
                        'amountTotal' => $adv_amountTotal_added ? $adv_amountTotal_added : 0,
                        'loan' => $loan_added ? $loan_added : 0,
                        'advance' => $advance_added ? $advance_added : 0,
                        'total_deduction' => $total_deduction_added,
                        'net_pay' => $net_pay_added,
                        'hours' => 120,
                        'ot_hours' => $overtime_hours_added,
                        'ot_pay' => $overtime_added,
                        'earnings' => $earnings_added,
                        'incentives' => $incentives_added,
                        'allowance' => $allowance_added,
                        'absences' => $absences_added,
                        'tardiness' => $tardiness_added,
                        'undertime' => $undertime_added,
                        'bonus' => $monthRecord === '12' ? ($bonus_added / 12) : 0
                    ]);
                }
            }
        } else {
            $userRecord_payroll[] = [
                'payroll_id' => '',
                'processtype' => '',
                'user_id' => '',
                'fname' => '',
                'mname' => '',
                'lname' => '',
                'monthly_rate' => '',
                'daily_rate' => '',
                'hourly_rate' => '',
                'sss_employee' => '',
                'sss_employers' => '',
                'phil_employee' => '',
                'phil_employers' => '',
                'pbg_employee' => '',
                'pbg_employers' => '',
                'insure_employee' => '',
                'insure_employers' => '',
                'tax' => '',
                'taxable' => '',
                'exempt' => '',
                'amountTotal' => '',
                'loan' => '',
                'advance' => '',
                'total_deduction' => '',
                'net_pay' => '',
                'hours' => '',
                'ot_hours' => '',
                'ot_pay' => '',
                'earnings' => '',
                'incentives' => '',
                'allowance' => '',
                'absences' => '',
                'tardiness' => '',
                'undertime' => '',
                'bonus' => ''
            ];
        }

        return response()->json([
            'status' => 200,
            'payrollRecords' => $userRecord_payroll,
            'payroll_from' => $payroll_fromdate ? $payroll_fromdate : $payroll_fromdate_added,
            'payroll_to' => $payroll_todate ? $payroll_todate : $payroll_todate_added,
            'test' =>  $total_all_deduct,
            'total_monthly' => $total_monthly + $total_monthly_added,
            'total_ot' => $total_ot + $total_ot_added,
            'total_incentive' => $total_incentive + $total_incentive_added,
            'total_allowance' => $total_allowance + $total_allowance_added,
            'total_absences' => $total_absences + $total_absences_added,
            'total_tardiness' => $total_tardiness + $total_tardiness_added,
            'total_undertime' => $total_undertime + $total_undertime_added,
            'total_gross' => $total_gross + $total_gross_added,
            'total_sss_emps' => $total_sss_emps + $total_sss_emps_added,
            'total_sss_empr' => $total_sss_empr + $total_sss_empr_added,
            'total_phil_emps' => $total_phil_emps + $total_phil_emps_added,
            'total_phil_empr' => $total_phil_empr + $total_phil_empr_added,
            'total_pgbig_emps' => $total_pgbig_emps + $total_pgbig_emps_added,
            'total_pgbig_empr' => $total_pgbig_empr + $total_pgbig_empr_added,
            'total_insurance_emps' => $total_insurance_emps + $total_insurance_emps_added,
            'total_insurance_empr' => $total_insurance_empr + $total_insurance_empr_added,
            'total_tax' => $total_tax + $total_tax_added,
            'total_cash_advance' => $total_cash_advance + $total_cash_advance_added,
            'total_loan' => $total_loan + $total_loan_added,
            'total_advance_deduct' => $total_advance_deduct + $total_advance_deduct_added,
            'total_all_deduct' => $total_all_deduct + $total_all_deduct_added,
            'total_all_pay' => $total_all_pay + $total_all_pay_added,
            'total_bonus' => $monthRecord === '12' ? ($total_bonus + $total_bonus_added) : 0
        ]);
    }

    public function getPayrollSummaryHistory($id, $dates)
    {
        // log::info("HrPayrollSummaryController::getPayrollSummaryHistory");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $userTeam = DB::table('user')->select('*')->where('user_id', $userID)->first();

        $recordsDate = explode(",", $dates);
        $monthRecord = $recordsDate[0];
        $yearRecord = $recordsDate[1];

        $userRecord_payroll = array();

        if ($userTeam->user_type === 'Super Admin') {
            $admin = DB::table('user')->select('*')->where('user_id', $id)->first();
            $users = DB::table('user')
                ->select(DB::raw("
                    user.user_id,
                    user.fname,
                    user.mname,
                    user.lname,
                    user.monthly_rate"
                ))
                ->where('is_deleted', '=', 0)
                ->where('team', '=', $admin->team)
                ->orderBy('lname', 'asc')
                ->orderBy('fname', 'asc')
                ->orderBy('mname', 'asc')
                ->get();
        } else {
            $users = DB::table('user')
                ->select(DB::raw("
                    user.user_id,
                    user.fname,
                    user.mname,
                    user.lname,
                    user.monthly_rate"
                ))
                ->where('is_deleted', '=', 0)
                ->where('team', '=', $userTeam->team)
                ->orderBy('lname', 'asc')
                ->orderBy('fname', 'asc')
                ->orderBy('mname', 'asc')
                ->get();
        }

        foreach ($users as $user) {
            $payroll_id = '';
            $processtype = '';
            $sss_employee = 0;
            $sss_employers = 0;
            $phil_employee = 0;
            $phil_employers = 0;
            $pbg_employee = 0;
            $pbg_employers = 0;
            $insure_employee = 0;
            $insure_employers = 0;
            $incentives = 0;
            $allowance = 0;
            $tax = 0;
            $loan = 0;
            $total_deduction = 0;
            $overtime = 0;
            $earnings = 0;
            $net_pay = 0;
            $todate = 0;
            $total_deduction = 0;
            $payroll_id = 0;
            $processtype = 0;
            $app_hours = 0;
            $payrollList = DB::table('hr_payroll_allrecords')
                ->select(
                    'hr_payroll_allrecords.payroll_id',
                    'hr_payroll_allrecords.processtype',
                    'hr_payroll_allrecords.payroll_fromdate',
                    'hr_payroll_allrecords.payroll_todate',
                    'hr_payroll_allrecords.total_deduction',
                    'hr_payroll_allrecords.overtime',
                    'hr_payroll_allrecords.total_earnings',
                    'hr_payroll_allrecords.net_pay',
                    'hr_payroll_allrecords.payroll_todate',
                    'hr_payroll_allrecords.incentives',
                    'hr_payroll_allrecords.allowance',
                    'hr_payroll_benefits.totalAmount',
                    'hr_payroll_benefits.type',
                    'hr_employee_benefits_list.title'
                )
                ->join('hr_payroll_benefits', 'hr_payroll_benefits.payroll_id', '=', 'hr_payroll_allrecords.payroll_id')
                ->join('hr_employee_benefits_list', 'hr_employee_benefits_list.benefitlist_id', '=', 'hr_payroll_benefits.benefitlist_id')
                ->whereRaw('MONTH(payroll_todate) = ?', [$monthRecord])
                ->whereRaw('YEAR(payroll_todate) = ?', [$yearRecord])
                ->where('hr_payroll_allrecords.emp_id', '=', $user->user_id)
                ->orderBy('payroll_todate', 'asc')
                ->get();

            if (!empty($payrollList)) {
                foreach ($payrollList as $payroll) {
                    $total_deduction = $payroll->total_deduction;
                    $payroll_id = $payroll->payroll_id;
                    $processtype = $payroll->processtype;
                    $overtime = $payroll->overtime;
                    $earnings = $payroll->total_earnings;
                    $net_pay = $payroll->net_pay;
                    $todate = $payroll->payroll_todate;
                    $incentives = $payroll->incentives;
                    $allowance = $payroll->allowance;

                    if ($payroll->type == 1) {
                        if ($payroll->title == 'SSS') {
                            $sss_employers = $payroll->totalAmount;
                        }
                        if ($payroll->title == 'PHILHEALTH') {
                            $phil_employers = $payroll->totalAmount;
                        }
                        if ($payroll->title == 'PAGIBIG') {
                            $pbg_employers = $payroll->totalAmount;
                        }
                        if ($payroll->title == 'INSURANCE') {
                            $insure_employers = $payroll->totalAmount;
                        }
                    }
                    if ($payroll->type == 2) {
                        $loan = $payroll->totalAmount;
                    }
                    if ($payroll->type == 3) {
                        if ($payroll->title == 'SSS') {
                            $sss_employee = $payroll->totalAmount;
                        }
                        if ($payroll->title == 'PHILHEALTH') {
                            $phil_employee = $payroll->totalAmount;
                        }
                        if ($payroll->title == 'PAGIBIG') {
                            $pbg_employee = $payroll->totalAmount;
                        }
                        if ($payroll->title == 'INSURANCE') {
                            $insure_employee = $payroll->totalAmount;
                        }
                    }
                    if ($payroll->type == 4) {
                        $tax = $payroll->totalAmount;
                    }
                }
                $appList = DB::table('hr_applications')
                    ->select(DB::raw('*'), DB::raw('SUM(app_hours) as totalAppHours'))
                    ->where('user_id', '=', $user->user_id)
                    ->where('status', '=', 'Approved')
                    ->whereRaw('MONTH(date_from) = ?', [$monthRecord])
                    ->whereRaw('YEAR(date_from) = ?', [$yearRecord])
                    ->orderBy('date_from', 'asc')
                    ->get();

                $app_hours = $appList[0]->totalAppHours ? $appList[0]->totalAppHours : 0;

                if (count($payrollList) != 0) {
                    $userRecord_payroll[] = [
                        'payroll_id' => $payroll_id,
                        'processtype' => $processtype,
                        'user_id' => $user->user_id,
                        'fname' => $user->fname,
                        'mname' => $user->mname,
                        'lname' => $user->lname,
                        'monthly_rate' => $user->monthly_rate / 2,
                        'sss_employee' => $sss_employee,
                        'sss_employers' => $sss_employers,
                        'phil_employee' => $phil_employee,
                        'phil_employers' => $phil_employers,
                        'pbg_employee' => $pbg_employee,
                        'pbg_employers' => $pbg_employers,
                        'insure_employee' => $insure_employee,
                        'insure_employers' => $insure_employers,
                        'incentives' => $incentives,
                        'allowance' => $allowance,
                        'tax' => $tax,
                        'loan' => $loan,
                        'total_deduction' => $total_deduction,
                        'net_pay' => $net_pay,
                        'todate' => $todate,
                        'hours' => 120,
                        'ot_hours' => $app_hours,
                        'ot_pay' => $overtime,
                        'earnings' => $earnings
                    ];
                }
            }
        }

        return response()->json([
            'status' => 200,
            'payrollRecords' => $userRecord_payroll,
        ]);
    }

    public function addPayrollSummaryEmployee(Request $request)
    {
        log::info("HrPayrollSummaryController::addPayrollSummaryEmployee");

        $payrollData = $request->validate([
            'fname' => 'required',
            'mname' => 'required',
            'lname' => 'required',
            'grosspay' => 'required',
            'fromDate' => 'required',
            'toDate' => 'required',
            'cutoff' => 'required',
            'total_deduction' => 'required',
            'net_pay' => 'required'
        ]);

        $additionalBenefits = $request->validate([
            'sss_employee' => 'nullable',
            'phil_employee' => 'nullable',
            'pgbig_employee' => 'nullable'
        ]);

        $Contribution = $request->validate([
            'sss_employer' => 'nullable',
            'phil_employer' => 'nullable',
            'pgbig_employer' => 'nullable'
        ]);

        try {
            $payroll_id = DB::table('hr_payroll_allrecords')->insertGetId(array(
                'fname' => $payrollData['fname'],
                'mname' => $payrollData['mname'],
                'lname' => $payrollData['lname'],
                'payroll_cutoff' => $payrollData['cutoff'],
                'monthly_rate' => $payrollData['grosspay'] * 2,
                'basic_pay' => $payrollData['grosspay'],
                'total_earnings' => $payrollData['grosspay'],
                'total_gross' => $payrollData['grosspay'],
                'payroll_fromdate' => $payrollData['fromDate'],
                'payroll_todate' => $payrollData['toDate'],
                'processtype' => 4,
                'total_contribution' => array_sum($Contribution),
                'total_deduction' => $payrollData['total_deduction'],
                'net_pay' => $payrollData['net_pay'],
            ));

            // Employee Insert Benefits
            HrPayrollBenefit::create([
                'payroll_id' => $payroll_id,
                'list_name' => 'SSS',
                'totalAmount' => $additionalBenefits['sss_employee'] ?? 0,
                'type' => 1
            ]);

            HrPayrollBenefit::create([
                'payroll_id' => $payroll_id,
                'list_name' => 'PHILHEALTH',
                'totalAmount' => $additionalBenefits['phil_employee'] ?? 0,
                'type' => 1
            ]);

            HrPayrollBenefit::create([
                'payroll_id' => $payroll_id,
                'list_name' => 'PAGIBIG',
                'totalAmount' => $additionalBenefits['pgbig_employee'] ?? 0,
                'type' => 1
            ]);
            // END

            // Employer Insert Benefits
            HrPayrollBenefit::create([
                'payroll_id' => $payroll_id,
                'list_name' => 'SSS',
                'totalAmount' => $Contribution['sss_employer'] ?? 0,
                'type' => 3
            ]);

            HrPayrollBenefit::create([
                'payroll_id' => $payroll_id,
                'list_name' => 'PHILHEALTH',
                'totalAmount' => $Contribution['phil_employer'] ?? 0,
                'type' => 3
            ]);

            HrPayrollBenefit::create([
                'payroll_id' => $payroll_id,
                'list_name' => 'PAGIBIG',
                'totalAmount' => $Contribution['pgbig_employer'] ?? 0,
                'type' => 3
            ]);
            // END

            $message = 'Success';
        } catch (Exception $e) {
            $message = $e;
        }
        return response()->json([ 'status' => 200, 'EmployeeData' => $message ]);
    }

    public function deletePayrollSummaryEmployee(Request $request)
    {
        log::info("HrPayrollSummaryController::deletePayrollSummaryEmployee");

        if (Auth::check()) {
            $userID = Auth::id();
        } else {
            $userID = null;
        }

        $user = DB::table('user')
            ->select('*')
            ->where('user_id', $userID)
            ->first();

        $payroll_id = $request->validate([
            'payroll_id' => 'required'
        ]);

        try {
            DB::table('hr_payroll_allrecords')->where('payroll_id', $payroll_id['payroll_id'])
                ->update(['is_deleted' => 1, 'deleted_by' => $user->user_id]);
            DB::table('hr_payroll_benefits')->where('payroll_id', $payroll_id['payroll_id'])
                ->update(['is_deleted' => 1, 'deleted_by' => $user->user_id]);
            DB::table('hr_payroll_earnings')->where('payroll_id', $payroll_id['payroll_id'])
                ->update(['is_deleted' => 1, 'deleted_by' => $user->user_id]);

            $message = 'Success';
        } catch (Exception $e) {
            $message = $e;
        }

        return response()->json([
            'status' => 200,
            'delete' => $message
        ]);
    }
}
