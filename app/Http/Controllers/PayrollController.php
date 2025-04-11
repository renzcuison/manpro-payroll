<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\PayslipsModel;
use App\Models\PayslipLeavesModel;
use App\Models\PayslipBenefitsModel;
use App\Models\PayslipEarningsModel;
use App\Models\PayslipDeductionsModel;

use App\Models\ApplicationsModel;
use App\Models\AttendanceLogsModel;
use App\Models\ApplicationTypesModel;
use App\Models\EmployeeBenefitsModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;

use Carbon\Carbon;

class PayrollController extends Controller
{
    public function checkUserAdmin()
    {
        // Log::info("PayrollController::checkUserAdmin");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    public function checkUserEmployee()
    {
        // Log::info("PayrollController::checkUserEmployee");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Employee') {
                return true;
            }
        }

        return false;
    }

    public function getNumberOfDays(Carbon $startDate, Carbon $endDate)
    {
        // Log::info("PayrollController::getNumberOfDays");

        // Initialize counters
        $numberOfDays = $startDate->diffInDays($endDate) + 1; // Include start and end date
        $numberOfSaturday = 0;
        $numberOfSunday = 0;
        $numberOfHoliday = 0;

        // Fetch Philippine holidays from Nager.Date API
        $holidays = $this->getNagerHolidays($startDate->year, $endDate->year);

        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            // Check for Saturday or Sunday
            if ($currentDate->isSaturday()) {
                $numberOfSaturday++;
            } elseif ($currentDate->isSunday()) {
                $numberOfSunday++;
            }

            // Check if it's a holiday
            $holidayDate = $currentDate->format('Y-m-d'); // Format date as YYYY-MM-DD
            if (in_array($holidayDate, $holidays)) {
                $numberOfHoliday++;
            }

            // Move to the next day
            $currentDate->addDay();
        }

        // Return the results
        return [
            'numberOfDays' => $numberOfDays,
            'numberOfSaturday' => $numberOfSaturday,
            'numberOfSunday' => $numberOfSunday,
            'numberOfHoliday' => $numberOfHoliday,
        ];
    }

    public function getNagerHolidays($startYear, $endYear)
    {
        $holidays = [];
        $countryCode = 'PH';

        // Fetch holidays for each year in the range
        for ($year = $startYear; $year <= $endYear; $year++) {
            $url = "https://date.nager.at/api/v3/PublicHolidays/{$year}/{$countryCode}";

            $response = Http::get($url);

            if ($response->successful()) {
                $data = $response->json();

                // Log the API response for debugging
                // Log::info("Nager.Date API Response for {$year}: " . json_encode($data));

                // Ensure $data is an array before iterating
                if (is_array($data)) {
                    foreach ($data as $holiday) {
                        $holidays[] = Carbon::parse($holiday['date'])->format('Y-m-d');
                    }
                } else {
                    Log::error("Nager.Date API returned invalid data for year {$year}: " . json_encode($data));
                }
            } else {
                Log::error("Failed to fetch holidays from Nager.Date API for year {$year}: " . $response->status());
                Log::error($response->body());
            }
        }

        return $holidays;
    }

    public function getGoogleCalendarHolidays(Carbon $startDate, Carbon $endDate)
    {
        // log::info("PayrollController::getGoogleCalendarHolidays");

        $apiKey = 'AIzaSyAPJ1Ua6xjhqwbjsucXeUCYYGUnObnJPU8';
        $calendarId = 'en.philippines#holiday@group.v.calendar.google.com';

        // Prepare the API endpoint to fetch holidays within the date range
        $startDateFormatted = $startDate->toIso8601String();
        $endDateFormatted = $endDate->toIso8601String();

        $url = "https://www.googleapis.com/calendar/v3/calendars/{$calendarId}/events";
        $url .= "?key={$apiKey}&timeMin={$startDateFormatted}&timeMax={$endDateFormatted}&singleEvents=true";

        // Make the API request
        $response = Http::get($url);

        if ($response->successful()) {
            $events = $response->json()['items'];
            $holidays = [];

            foreach ($events as $event) {
                // Extract the date of the holiday and add to the holidays array
                $holidayDate = Carbon::parse($event['start']['date'])->format('Y-m-d');
                $holidays[] = $holidayDate;
            }

            return $holidays;
        } else {
            Log::error("Failed to fetch Google Calendar holidays: " . $response->status());
            log::error($response);
            return [];
        }
    }

    public function payrollProcess(Request $request)
    {
        // log::info("PayrollController::payrollProcess");

        $user = Auth::user();

        if ($this->checkUserAdmin()) {

            $request->validate([
                'startDate' => 'required|date',
                'endDate' => 'required|date|after_or_equal:startDate',
            ]);

            $startDate = $request->startDate;
            $endDate = $request->endDate;

            $employees = UsersModel::whereHas('attendanceLogs', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('timestamp', [$startDate, $endDate]);
            })->where('client_id', $user->client_id)->get();

            $payrolls = [];

            foreach ($employees as $employee) {

                $logs = AttendanceLogsModel::where('user_id', $employee->id)->whereBetween('timestamp', [$startDate, $endDate])->get();

                $distinctDays = $logs->groupBy(function ($log) {
                    return Carbon::parse($log->timestamp)->toDateString();
                });

                $numberOfPresent = $distinctDays->count();

                $payrollData = $this->getNumberOfDays(Carbon::parse($startDate), Carbon::parse($endDate));

                $numberOfDays = $payrollData['numberOfDays'];
                $numberOfSaturday = $payrollData['numberOfSaturday'];
                $numberOfSunday = $payrollData['numberOfSunday'];
                $numberOfHoliday = $payrollData['numberOfHoliday'];

                $numberOfWorkingDays = $numberOfDays - $numberOfSaturday - $numberOfSunday - $numberOfHoliday;
                $numberOfAbsentDays = $numberOfWorkingDays - $numberOfPresent;

                $payrolls[] = [
                    'id' => $employee->id,
                    'employeeId' => $employee->id,
                    'employeeName' => $employee->first_name . ' ' . $employee->middle_name . ' ' . $employee->last_name . ' ' . $employee->suffix,
                    'employeeBranch' => $employee->branch->name ?? '-',
                    'employeeDepartment' => $employee->department->name ?? '-',
                    'employeeRole' => $employee->role->name ?? '-',
                    'employeeSalary' => $employee->salary,
                    'payrollDates' => $startDate  . ' - ' . $endDate,
                    'numberOfPresent' => $numberOfPresent,
                    'numberOfAbsentDays' => $numberOfAbsentDays,
                    'numberOfWorkingDays' => $numberOfWorkingDays,
                    'numberOfDays' => $numberOfDays,
                    'numberOfHoliday' => $numberOfHoliday,
                    'grossPay' => $employee->salary,
                ];
            }

            return response()->json(['status' => 200, 'payrolls' => $payrolls]);
        }

        return response()->json(['status' => 200, 'payrolls' => null]);
    }

    public function calculateTax($salary, $contribution)
    {
        log::info("PayrollController::calculateTax");

        $taxableIncome = $salary - $contribution;
        $withholdingTax = 0;
        $compensationLevel = 0;

        if ($taxableIncome < 20833) {
            $withholdingTax = 0;
            $compensationLevel = 0;
        } else if ($taxableIncome >= 20833 && $taxableIncome <= 33332) {
            $withholdingTax = 15;
            $compensationLevel = 20833;
        } else if ($taxableIncome >= 33333 && $taxableIncome <= 66666) {
            $withholdingTax = 20;
            $compensationLevel = 33333;
        } else if ($taxableIncome >= 66667 && $taxableIncome <= 16666) {
            $withholdingTax = 25;
            $compensationLevel = 66667;
        } else if ($taxableIncome >= 166667 && $taxableIncome <= 666666) {
            $withholdingTax = 30;
            $compensationLevel = 166667;
        } else if ($taxableIncome >= 666667) {
            $withholdingTax = 35;
            $compensationLevel = 666667;
        }

        log::info("==================================");
        log::info("salary               :" . $salary);
        log::info("contribution         :" . $contribution);
        log::info("withholdingTax       :" . $withholdingTax);
        log::info("==================================");

        log::info("==================================");
        log::info("taxableIncome        :" . $taxableIncome);
        log::info("compensationLevel    :" . $compensationLevel);
        log::info("==================================");

        $percentage = $withholdingTax / 100;
        $incomeTax = ($taxableIncome - $compensationLevel) * $percentage;
        log::info("==================================");
        log::info("percentage           :" . $salary);
        log::info("incomeTax            :" . $incomeTax);
        log::info("==================================");

        return $incomeTax;
    }

    public function payrollDetails(Request $request)
    {
        // log::info("PayrollController::payrollDetails");

        $startDate = $request->currentStartDate;
        $endDate = $request->currentEndDate;

        $employee = UsersModel::with('workHours')->find($request->selectedPayroll);
        $employeeBenefits = EmployeeBenefitsModel::where('user_id', $employee->id)->get();
        $logs = AttendanceLogsModel::where('user_id', $employee->id)->whereBetween('timestamp', [$startDate, $endDate])->get();

        $employeeShare = 0;
        $employerShare = 0;

        $benefits = [];

        foreach ($employeeBenefits as $employeeBenefit) {

            // ============== BENEFITS ==============
            $benefit = $employeeBenefit->benefit;

            if ($benefit->type == "Percentage") {
                $employeeAmount = $employee->salary * ($benefit->employee_percentage / 100);
                $employerAmount = $employee->salary * ($benefit->employer_percentage / 100);
            }

            if ($benefit->type == "Amount") {
                $employeeAmount = $benefit->employee_amount * 1;
                $employerAmount = $benefit->employer_amount * 1;
            }

            $employeeShare += $employeeAmount;
            $employerShare += $employerAmount;

            $benefits[] = ['benefit' => encrypt($benefit->id), 'name' => $benefit->name, 'employeeAmount' => $employeeAmount, 'employerAmount' => $employerAmount];
        }

        $benefits[] = [
            'benefit' => "",
            'name' => "Total Benefits",
            'employeeAmount' => $employeeShare,
            'employerAmount' => $employerShare
        ];

        // ============== WORK DAYS ==============
        $distinctDays = $logs->groupBy(function ($log) {
            return Carbon::parse($log->timestamp)->toDateString();
        });

        $numberOfPresent = $distinctDays->count();

        $payrollData = $this->getNumberOfDays(Carbon::parse($startDate), Carbon::parse($endDate));

        $numberOfDays = $payrollData['numberOfDays'];
        $numberOfSaturday = $payrollData['numberOfSaturday'];
        $numberOfSunday = $payrollData['numberOfSunday'];
        $numberOfHoliday = $payrollData['numberOfHoliday'];

        $numberOfWorkingDays = $numberOfDays - $numberOfSaturday - $numberOfSunday - $numberOfHoliday;
        $numberOfAbsentDays = $numberOfWorkingDays - $numberOfPresent;

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $workHours = $employee->workHours;

        try {
            $firstIn = Carbon::createFromFormat('H:i:s', $workHours->first_time_in);
            $firstOut = Carbon::createFromFormat('H:i:s', $workHours->first_time_out);
            $breakStart = Carbon::createFromFormat('H:i:s', $workHours->break_start);
            $breakEnd = Carbon::createFromFormat('H:i:s', $workHours->break_end);
            $secondIn = Carbon::createFromFormat('H:i:s', $workHours->second_time_in);
            $secondOut = Carbon::createFromFormat('H:i:s', $workHours->second_time_out);
        } catch (\Carbon\Exceptions\InvalidFormatException $e) {
            $firstIn = Carbon::createFromFormat('H:i:s', '09:00:00');
            $firstOut = Carbon::createFromFormat('H:i:s', '17:00:00');
            $breakStart = Carbon::createFromFormat('H:i:s', '12:00:00');
            $breakEnd = Carbon::createFromFormat('H:i:s', '13:00:00');
            $secondIn = Carbon::createFromFormat('H:i:s', '14:00:00');
            $secondOut = Carbon::createFromFormat('H:i:s', '22:00:00');
        }

        if ($workHours->shift_type === 'Regular') {
            $dayStart = $firstIn;
            $dayEnd = $firstOut;
            $gapStart = $breakStart;
            $gapEnd = $breakEnd;
        } elseif ($workHours->shift_type === 'Split') {
            $dayStart = $firstIn;
            $dayEnd = $secondOut;
            $gapStart = $firstOut;
            $gapEnd = $secondIn;
        }

        $totalWorkHours = $firstOut->diffInSeconds($firstIn) / 3600;
        if ($workHours->shift_type === 'Regular') {
            $totalWorkHours -= $breakEnd->diffInSeconds($breakStart) / 3600;
        } elseif ($workHours->shift_type === 'Split') {
            $totalWorkHours += $secondOut->diffInSeconds($secondIn) / 3600;
        }

        $perCutOff = $employee->salary / 2;
        $perDay = $perCutOff / $numberOfWorkingDays;
        $perHour = $perDay / $totalWorkHours;
        $perMin = $perHour / 60;

        $absents = $perDay * $numberOfAbsentDays;

        // ============== LEAVES ==============
        $paidLeaves = [];
        $unpaidLeaves = [];
        $leaveEarnings = 0;

        $leaveParams = [
            'employee_id' => $employee->id,
            'client_id' => $employee->id,
            'start' => $start,
            'end' => $end,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'day_start' => $dayStart,
            'day_end' => $dayEnd,
            'gap_start' => $gapStart,
            'gap_end' => $gapEnd,
            'total_hours' => $totalWorkHours,
            'per_hour' => $perHour,
        ];

        $leaveDeductions = $this->getLeaveDeductions($leaveParams);
        $paidLeaves = $leaveDeductions['paid_leaves'];
        $unpaidLeaves = $leaveDeductions['unpaid_leaves'];
        $leaveEarnings = $leaveDeductions['leave_earnings'];

        // ============== RESPONSE PREP ==============
        $basicPay = $perCutOff - $leaveEarnings;
        $overTimePay = 0;
        $holidayPay = 0;

        $absents = $absents - $leaveEarnings;

        $earnings = [
            ['earning' => '1', 'name' => 'Basic Pay', 'amount' => $basicPay],
            ['earning' => '2', 'name' => 'Over Time Pay', 'amount' => $overTimePay],
            ['earning' => '3', 'name' => 'Holiday Pay', 'amount' => $holidayPay],
        ];

        $tardiness = 0;
        $cashAdvance = 0;
        $loans = 0;

        $tax = $this->calculateTax($employee->salary, $employeeShare);
        log::info("Returned Tax: " . $tax);

        $tardinessTime = $this->getTardiness($startDate, $endDate, $employee->id);
        $tardiness = $perMin * $tardinessTime;

        $totalEarnings =  $basicPay + $overTimePay + $holidayPay - $absents + $leaveEarnings - $tardiness;
        $totalDeductions =  $employeeShare + $cashAdvance + $loans + $tax;

        $payroll = [
            'employeeId' => $employee->user_name,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'numberOfPresent' => $numberOfPresent,
            'numberOfAbsentDays' => $numberOfAbsentDays,
            'numberOfWorkingDays' => $numberOfWorkingDays,
            'numberOfDays' => $numberOfDays,
            'numberOfSaturday' => $numberOfSaturday,
            'numberOfSunday' => $numberOfSunday,
            'numberOfHoliday' => $numberOfHoliday,
            'perMonth' => $employee->salary,
            'perDay' => $perDay,
            'perHour' => $perHour,
            'perMin' => $perMin,
            'employeeShare' => $employeeShare,
            'employerShare' => $employerShare,
            'tax' => $tax,
        ];

        $deductions = [
            ['deduction' => '1', 'name' => "Absents ({$numberOfAbsentDays} day)", 'amount' => $absents],
            ['deduction' => '2', 'name' => "Tardiness ({$tardinessTime} min)", 'amount' => $tardiness],
            ['deduction' => '3', 'name' => "Cash Advance", 'amount' => $cashAdvance],
        ];

        $summaries = [
            ['name' => 'Total Earnings', 'amount' => $totalEarnings],
            ['name' => 'Total Deductions', 'amount' => $totalDeductions],
            ['name' => 'Net Pay', 'amount' =>  $totalEarnings - $totalDeductions],
        ];

        return response()->json([
            'status' => 200,
            'payroll' => $payroll,
            'benefits' => $benefits,
            'earnings' => $earnings,
            'deductions' => $deductions,
            'summaries' => $summaries,
            'paid_leaves' => $paidLeaves,
            'unpaid_leaves' => $unpaidLeaves,
        ]);
    }

    public function savePayroll(Request $request)
    {
        // Log::info("PayrollController::savePayroll");

        $user = Auth::user();

        $payrollRequest = new Request(['selectedPayroll' => $request->selectedPayroll, 'currentStartDate' => $request->currentStartDate, 'currentEndDate' => $request->currentEndDate]);

        // Call payrollDetails() and get response
        $payrollResponse = $this->payrollDetails($payrollRequest);

        // Decode JSON response to access data
        $payrollData = json_decode($payrollResponse->getContent(), true);

        if (!$payrollData) {
            Log::error("Failed to decode payroll data.");
            return response()->json(['error' => 'Invalid payroll data'], 500);
        }

        $totalEarning = 0;
        $totalDeduction = 0;

        foreach ($payrollData['summaries'] as $summary) {
            if ($summary['name'] === 'Total Earnings') {
                $totalEarning = $summary['amount'];
            }

            if ($summary['name'] === 'Total Deductions') {
                $totalDeduction = $summary['amount'];
            }
        }

        $payroll = $payrollData['payroll'];

        try {
            DB::beginTransaction();

            $payslip = PayslipsModel::create([
                "employee_id" => $request->selectedPayroll,
                "period_start" => $request->currentStartDate,
                "period_end" => $request->currentEndDate,
                "working_days" => $payroll['numberOfWorkingDays'],

                "total_earnings" => $totalEarning,
                "total_deductions" => $totalDeduction,

                "rate_monthly" => $payroll['perMonth'],
                "rate_daily" => $payroll['perDay'],
                "rate_hourly" => $payroll['perHour'],

                "client_id" => $user->client_id,
                "user_id" => $user->id,
            ]);

            foreach ($payrollData['earnings'] as $earning) {
                $newEarning = PayslipEarningsModel::create(["payslip_id" => $payslip->id, "earning_id" => $earning['earning'], "amount" => $earning['amount']]);
            }

            foreach ($payrollData['deductions'] as $deduction) {
                $newDeduction = PayslipDeductionsModel::create(["payslip_id" => $payslip->id, "deduction_id" => $deduction['deduction'], "amount" => $deduction['amount']]);
            }

            foreach ($payrollData['paid_leaves'] as $paidLeave) {
                $newPaidLeave = PayslipLeavesModel::create(["payslip_id" => $payslip->id, "application_type_id" => decrypt($paidLeave['application']), "amount" => $paidLeave['amount'], "is_paid" => true]);
            }

            foreach ($payrollData['unpaid_leaves'] as $unpaidLeave) {
                $newUnpaidLeave = PayslipLeavesModel::create(["payslip_id" => $payslip->id, "application_type_id" => decrypt($unpaidLeave['application']), "amount" => $unpaidLeave['amount'], "is_paid" => false]);
            }

            foreach ($payrollData['benefits'] as $benefit) {
                if ($benefit['name'] != "Total Benefits") {
                    $newBenefit = PayslipBenefitsModel::create(["payslip_id" => $payslip->id, "benefit_id" => decrypt($benefit['benefit']), "employee_amount" => $benefit['employeeAmount'], "employer_amount" => $benefit['employerAmount']]);
                }
            }

            DB::commit();

            return response()->json(['status' => 200]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Error saving: " . $e->getMessage());

            throw $e;
        }


        return response()->json(['status' => 200]);
    }

    public function savePayrolls(Request $request)
    {
        // Log::info("PayrollController::savePayrolls");

        $currentStartDate = $request->currentStartDate;
        $currentEndDate = $request->currentEndDate;

        foreach ($request->selectedPayrolls as $selectedPayroll) {
            $payrollRequest = new Request(['selectedPayroll' => $selectedPayroll, 'currentStartDate' => $currentStartDate, 'currentEndDate' => $currentEndDate]);

            $this->savePayroll($payrollRequest);
        }

        return response()->json(['status' => 200]);
    }

    public function getEmployeesPayrollRecords()
    {
        // log::info("PayrollController::getEmployeesPayrollRecords");

        if ($this->checkUserAdmin()) {
            $user = Auth::user();

            $rawRecords = PayslipsModel::where('client_id', $user->client_id)->get();

            $records = [];

            foreach ($rawRecords as $rawRecord) {
                $employee = UsersModel::find($rawRecord->employee_id);

                $records[] = [
                    'record' => encrypt($rawRecord->id),
                    'employeeName' => $employee->first_name . ' ' . $employee->middle_name . ' ' . $employee->last_name . ' ' . $employee->suffix,
                    'employeeBranch' => $employee->branch->name ?? '-',
                    'employeeDepartment' => $employee->department->name ?? '-',
                    'employeeRole' => $employee->role->name ?? '-',
                    'payrollStartDate' => $rawRecord->period_start ?? '-',
                    'payrollEndDate' => $rawRecord->period_end ?? '-',
                    'payrollWorkingDays' => $rawRecord->working_days ?? '-',
                    'payrollGrossPay' => $rawRecord->rate_monthly ?? '-',
                ];
            }


            return response()->json(['status' => 200, 'records' => $records]);
        }

        return response()->json(['status' => 200, 'employees' => null]);
    }

    public function getEmployeePayrollRecords()
    {
        // log::info("PayrollController::getEmployeePayrollRecords");

        if ($this->checkUserEmployee()) {
            $user = Auth::user();

            $rawRecords = PayslipsModel::where('employee_id', $user->id)->where('client_id', $user->client_id)->get();

            $records = [];

            foreach ($rawRecords as $rawRecord) {
                $employee = UsersModel::find($rawRecord->employee_id);

                $records[] = [
                    'record' => encrypt($rawRecord->id),
                    'employeeName' => $employee->first_name . ' ' . $employee->middle_name . ' ' . $employee->last_name . ' ' . $employee->suffix,
                    'employeeBranch' => $employee->branch->name ?? '-',
                    'employeeDepartment' => $employee->department->name ?? '-',
                    'employeeRole' => $employee->role->name ?? '-',
                    'payrollStartDate' => $rawRecord->period_start ?? '-',
                    'payrollEndDate' => $rawRecord->period_end ?? '-',
                    'payrollWorkingDays' => $rawRecord->working_days ?? '-',
                    'payrollGrossPay' => $rawRecord->rate_monthly ?? '-',
                ];
            }

            return response()->json(['status' => 200, 'records' => $records]);
        }

        return response()->json(['status' => 200, 'employees' => null]);
    }

    public function getPayrollRecord(Request $request)
    {
        // log::info("PayrollController::getPayrollRecord");

        if ($this->checkUserAdmin() || $this->checkUserEmployee()) {
            $record = PayslipsModel::find(decrypt($request->selectedPayroll));
            $employee = UsersModel::select('id', 'user_name')->find($record->employee_id);

            $payslip = [
                'benefit' => "",
                'employee' => $employee->user_name,
                'period_start' => $record->period_start,
                'period_end' => $record->period_end,
                'working_days' => $record->period_start,

                'rate_monthly' => $record->rate_monthly,
                'rate_daily' => $record->rate_daily,
                'rate_hourly' => $record->rate_hourly,
                'signature' => $record->signature,
            ];

            $benefits = [];
            $deductions = [];
            $earnings = [];
            $paid_leaves = [];
            $unpaid_leaves = [];

            foreach ($record->benefits as $benefit) {
                $benefits[] = [
                    'name' => $benefit->benefit->name,
                    'employee_amount' => $benefit->employee_amount,
                    'employer_amount' => $benefit->employer_amount,
                ];
            }

            foreach ($record->deductions as $deduction) {

                $name = "";

                switch ($deduction->deduction_id) {
                    case 1:
                        $name = 'Absents';
                        break;
                    case 2:
                        $name = 'Tardiness';
                        break;
                    case 3:
                        $name = 'Cash Advance';
                        break;
                    default:
                        $name = '-';
                        break;
                }

                $deductions[] = [
                    'name' => $name,
                    'amount' => $deduction->amount,
                ];
            }

            foreach ($record->earnings as $earning) {

                $name = "";

                switch ($earning->earning_id) {
                    case 1:
                        $name = 'Basic Pay';
                        break;
                    case 2:
                        $name = 'Over Time Pay';
                        break;
                    case 3:
                        $name = 'Holiday Pay';
                        break;
                    default:
                        $name = '-';
                        break;
                }

                $earnings[] = [
                    'name' => $name,
                    'amount' => $earning->amount,
                ];
            }

            $summaries = [
                ['name' => 'Total Earnings', 'amount' => $record->total_earnings],
                ['name' => 'Total Deductions', 'amount' => $record->total_deductions],
                ['name' => 'Net Pay', 'amount' =>  $record->total_earnings - $record->total_deductions],
            ];

            return response()->json(['status' => 200, 'payslip' => $payslip, 'benefits' => $benefits, 'deductions' => $deductions, 'earnings' => $earnings, 'paid_leaves' => $paid_leaves, 'unpaid_leaves' => $unpaid_leaves, 'summaries' => $summaries]);
        }
    }

    public function getTardiness($start_date, $end_date, $employeeId)
    {
        Log::info("Retrieving Tardiness");
        $user = Auth::user();

        $logs = AttendanceLogsModel::with('workHour')
            ->where('user_id', $employeeId)
            ->whereBetween('timestamp', [$start_date . ' 00:00:00', $end_date . ' 23:59:59'])
            ->orderBy('timestamp', 'asc')
            ->get()
            ->groupBy(fn($log) => Carbon::parse($log->timestamp)->format('Y-m-d'))
            ->sortKeysDesc()
            ->map(function ($logs) {
                $shift = $logs->first();
                $totalShiftDuration = 0;
                $totalRendered = 0;

                // Calculate total shift duration
                if ($shift->workHour->shift_type == "Regular") {
                    $shiftStart = Carbon::parse($shift->workHour->first_time_in);
                    $shiftEnd = Carbon::parse($shift->workHour->first_time_out);
                    $gapStart = Carbon::parse($shift->workHour->break_start);
                    $gapEnd = Carbon::parse($shift->workHour->break_end);
                    $totalShiftDuration = max($shiftStart->diffInMinutes($shiftEnd) - $gapStart->diffInMinutes($gapEnd), 0);
                } elseif ($shift->workHour->shift_type == "Split") {
                    $firstStart = Carbon::parse($shift->workHour->first_time_in);
                    $firstEnd = Carbon::parse($shift->workHour->first_time_out);
                    $secondStart = Carbon::parse($shift->workHour->second_time_in);
                    $secondEnd = Carbon::parse($shift->workHour->second_time_out);
                    $totalShiftDuration = $firstStart->diffInMinutes($firstEnd) + $secondStart->diffInMinutes($secondEnd);
                }

                // Calculate rendered time
                $start = null;
                foreach ($logs as $log) {
                    if (in_array($log->action, ["Duty In", "Overtime In"])) {
                        $start = Carbon::parse($log->timestamp);
                    } elseif ($start && in_array($log->action, ["Duty Out", "Overtime Out"])) {
                        $end = Carbon::parse($log->timestamp);
                        $isDuty = $log->action == "Duty Out";

                        // Determine shift boundaries
                        $shiftStart = $isDuty && $shift->workHour->shift_type == 'Regular'
                            ? Carbon::parse($shift->workHour->first_time_in)
                            : ($isDuty && $shift->workHour->shift_type == 'Split' && $start->format('H:i:s') < Carbon::parse($shift->workHour->first_time_out)->format('H:i:s')
                                ? Carbon::parse($shift->workHour->first_time_in)
                                : ($isDuty
                                    ? Carbon::parse($shift->workHour->second_time_in)
                                    : Carbon::parse($shift->workHour->over_time_in)));
                        $shiftEnd = $isDuty && $shift->workHour->shift_type == 'Regular'
                            ? Carbon::parse($shift->workHour->first_time_out)
                            : ($isDuty && $shift->workHour->shift_type == 'Split' && $start->format('H:i:s') < Carbon::parse($shift->workHour->first_time_out)->format('H:i:s')
                                ? Carbon::parse($shift->workHour->first_time_out)
                                : ($isDuty
                                    ? Carbon::parse($shift->workHour->second_time_out)
                                    : Carbon::parse($shift->workHour->over_time_out)));

                        // Normalize dates for time comparison
                        $today = Carbon::today();
                        $fixedStart = $start->setDate($today->year, $today->month, $today->day);
                        $fixedEnd = $end->setDate($today->year, $today->month, $today->day);
                        $fixedShiftStart = $shiftStart->setDate($today->year, $today->month, $today->day);
                        $fixedShiftEnd = $shiftEnd->setDate($today->year, $today->month, $today->day);

                        if ($fixedStart->format('H:i:s') < $fixedShiftEnd->format('H:i:s') && $fixedEnd->format('H:i:s') > $fixedShiftStart->format('H:i:s')) {
                            $renderedStart = max($fixedStart, $fixedShiftStart);
                            $renderedEnd = min($fixedEnd, $fixedShiftEnd);
                            $minutes = $renderedEnd->diffInMinutes($renderedStart);

                            // Adjust for break in Regular shift
                            if ($isDuty && $shift->workHour->shift_type == 'Regular') {
                                $gapStart = Carbon::parse($shift->workHour->break_start)->setDate($today->year, $today->month, $today->day);
                                $gapEnd = Carbon::parse($shift->workHour->break_end)->setDate($today->year, $today->month, $today->day);
                                $breakStart = max($renderedStart, $gapStart);
                                $breakEnd = min($renderedEnd, $gapEnd);
                                if ($breakStart->format('H:i:s') < $breakEnd->format('H:i:s')) {
                                    $minutes -= $breakStart->diffInMinutes($breakEnd);
                                }
                                $minutes = max($minutes, 0);
                            }

                            if ($isDuty) $totalRendered += $minutes;
                        }
                        $start = null;
                    }
                }

                return ['late_time' => max($totalShiftDuration - $totalRendered, 0)];
            })
            ->values();

        return $logs->sum('late_time');
    }

    public function storeSignature(Request $request, $id)
    {
        Log::info("PayrollController::storeSignature - Processing signature for payslip ID: {$id}");

        try {
            $request->validate([
                'signature' => 'required|string',
            ]);

            if (!$this->checkUserEmployee() && !$this->checkUserAdmin()) {
                return response()->json(['message' => 'Unauthorized access.'], 403);
            }

            $decryptedId = decrypt($id);
            $payslip = PayslipsModel::findOrFail($decryptedId);

            // Check if signature already exists
            if ($payslip->signature) {
                Log::info("PayrollController::storeSignature - Signature already exists for payslip ID: {$decryptedId}");
                return response()->json([
                    'message' => 'This payslip already has a signature.',
                ], 400);
            }

            $base64Image = $request->input('signature');
            $base64Image = substr($base64Image, strpos($base64Image, ',') + 1);
            $imageData = base64_decode($base64Image);

            if ($imageData === false) {
                throw new \Exception("Invalid base64 signature data.");
            }

            $directory = 'payroll/signature';
            $filename = 'payslip_signature_' . $decryptedId . '_' . time() . '.png';
            $filePath = "{$directory}/{$filename}";

            Storage::disk('public')->put($filePath, $imageData);

            $payslip->signature = $filePath;
            $payslip->save();

            Log::info("PayrollController::storeSignature - Signature saved successfully for payslip ID: {$decryptedId}, Filepath: {$filePath}");

            return response()->json([
                'message' => 'Signature uploaded and linked to payslip successfully.',
                'filename' => $filePath,
            ], 200);
        } catch (\Exception $e) {
            Log::error("PayrollController::storeSignature - Error: " . $e->getMessage(), ['payslip_id' => $id]);
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'An error occurred while storing the signature.',
            ], 500);
        }
    }

    public function getLeaveDeductions(array $params)
    {
        Log::info("Retrieving Leave Deductions");

        $employeeId = $params['employee_id'];
        $clientId = $params['client_id'];
        $start = $params['start'];
        $end = $params['end'];
        $startDate = $params['start_date'];
        $endDate = $params['end_date'];
        $dayStart = $params['day_start'];
        $dayEnd = $params['day_end'];
        $gapStart = $params['gap_start'];
        $gapEnd = $params['gap_end'];
        $totalWorkHours = $params['total_hours'];
        $perHour = $params['per_hour'];

        $paidLeaves = [];
        $unpaidLeaves = [];
        $leaveEarnings = 0;

        $applicationTypes = ApplicationTypesModel::select('id', 'name', 'client_id', 'percentage', 'is_paid_leave')->where('client_id', $clientId)->get();


        $applicationIds = $applicationTypes->pluck('id')->all();
        $applications = ApplicationsModel::select('id', 'type_id', 'duration_start', 'duration_end', 'status')
            ->where('user_id', $employeeId)
            ->whereIn('type_id', $applicationIds)
            ->where('status', 'Approved')
            ->where(function ($query) use ($startDate, $endDate) {
                $query->where('duration_start', '<=', $endDate)->where('duration_end', '>=', $startDate);
            })
            ->get()
            ->groupBy('type_id');

        foreach ($applicationTypes as $applicationType) {

            $apps = $applications->get($applicationType->id, collect());

            $days = 0;
            $totalHours = 0;

            foreach ($apps as $app) {
                $fromDate = Carbon::parse($app->duration_start);
                $toDate = Carbon::parse($app->duration_end);
                Log::info("================================");
                Log::info("App Starts     :" . $fromDate);
                Log::info("App Ends       :" . $toDate);

                $overlapStart = max($fromDate->startOfDay(), $start);
                $overlapEnd = min($toDate->startOfDay(), $end);

                $lastStart = $dayStart->copy()->setDateFrom($overlapEnd);
                $lastEnd = $dayEnd->copy()->setDateFrom($overlapEnd);
                $lastGapStart = $gapStart->copy()->setDateFrom($overlapEnd);
                $lastGapEnd = $gapEnd->copy()->setDateFrom($overlapEnd);

                if ($overlapStart <= $overlapEnd) {
                    $currentDate = $overlapStart->copy();
                    if ($overlapStart->isSameDay($overlapEnd)) {
                        Log::info("================================");
                        Log::info("Same Day Leave");
                        Log::info("Current Date   :" . $currentDate);
                        $appStart = Carbon::parse($app->duration_start)->setDateFrom(now());
                        $appEnd = Carbon::parse($app->duration_end)->setDateFrom(now());
                        $skipDay = true;
                        if (!$skipDay) {
                            $totalHours = 0;
                        } else {
                            if ($appStart->isAfter($dayEnd) || $appEnd->isBefore($dayStart)) {
                                // No Affected Hours within day, exclude from count
                                $totalHours = 0;
                            } else {
                                $affectedStart = max($appStart, $dayStart);
                                $affectedEnd = min($appEnd, $dayEnd);
                                $affectedTime = $affectedEnd->diffInSeconds($affectedStart) / 3600;

                                if ($affectedStart->lessThanOrEqualTo($gapStart)) {
                                    if ($affectedEnd->greaterThanOrEqualTo($gapEnd)) {
                                        $affectedTime -= $gapEnd->diffInSeconds($gapStart) / 3600;
                                    } elseif ($affectedEnd->greaterThan($gapStart)) {
                                        $affectedTime -= $affectedEnd->diffInSeconds($gapStart) / 3600;
                                    }
                                } elseif ($affectedStart->between($gapStart, $gapEnd)) {
                                    if ($affectedEnd->greaterThan($gapEnd)) {
                                        $affectedTime -= $affectedEnd->diffInSeconds($gapEnd) / 3600;
                                    } elseif ($affectedEnd->between($gapStart, $gapEnd)) {
                                        $affectedTime = 0;
                                    }
                                }
                                $totalHours = max(0, $affectedTime);
                            }
                        }
                    } else {
                        // Log::info("================================");
                        // Log::info("Multi Day Leave");
                        while ($currentDate->lessThanOrEqualTo($overlapEnd)) {
                            //Log::info("Current Date   :" . $currentDate);
                            $affectedTime = 0;

                            $skipDay = true;
                            if (!$skipDay) {
                                $totalHours = 0;
                            } else {
                                $appStart = Carbon::parse($app->duration_start)->setDateFrom(now());
                                $appEnd = Carbon::parse($app->duration_end);
                                if ($currentDate->greaterThan($fromDate) && $currentDate->lessThan($toDate)) {
                                    //Log::info("Full Day");
                                    $affectedTime = $totalWorkHours;
                                } elseif ($currentDate->isSameDay($fromDate) && !$appStart->isAfter($dayEnd)) {
                                    $affectedStart = max($appStart, $dayStart);
                                    $affectedTime = $dayEnd->diffInSeconds($affectedStart) / 3600;

                                    if ($affectedStart->lessThan($gapStart)) {
                                        $affectedTime -= $gapEnd->diffInSeconds($gapStart) / 3600;
                                    } elseif ($affectedStart->lessThan($gapEnd)) {
                                        $affectedTime -= $gapEnd->diffInSeconds($affectedStart) / 3600;
                                    }
                                    //Log::info("First Day:           {$affectedTime}");
                                } elseif ($currentDate->isSameDay($toDate) && !$appEnd->isBefore($lastStart)) {
                                    $affectedEnd = min($appEnd, $lastEnd);
                                    $affectedTime = $affectedEnd->diffInSeconds($lastStart) / 3600;

                                    if ($affectedEnd->greaterThan($lastGapEnd)) {
                                        $affectedTime -= $lastGapEnd->diffInSeconds($lastGapStart) / 3600;
                                    } elseif ($affectedEnd->greaterThan($lastGapStart)) {
                                        $affectedTime -= $affectedEnd->diffInSeconds($lastGapStart) / 3600;
                                    }
                                    //Log::info("Last Day:            {$affectedTime}");
                                }
                                $affectedTime = max(0, $affectedTime);
                            }

                            $totalHours += $affectedTime;
                            $currentDate->addDay();
                        }
                    }

                    Log::info("================================");
                    $days = floor($totalHours / $totalWorkHours);
                    $remainderHours = $totalHours % $totalWorkHours;

                    if ($applicationType->is_paid_leave) {
                        Log::info("Paid Leave");
                        Log::info("Leave Percentage:    {$applicationType->percentage}%");
                        $earningPerHour = $perHour * ($applicationType->percentage / 100);
                        $totalEarning = $totalHours * $earningPerHour;
                        $leaveEarnings += $totalEarning;

                        $paidLeaves[] = [
                            'application' => encrypt($applicationType->id),
                            'name' => $applicationType->name,
                            'days' => $days,
                            'hours' => $remainderHours,
                            'amount' => $totalEarning,
                        ];
                    } else {
                        Log::info("Unpaid Leave");
                        $earningPerHour = $perHour;
                        $totalEarning = $totalHours * $earningPerHour;
                        $leaveEarnings += $totalEarning;

                        $unpaidLeaves[] = [
                            'application' => encrypt($applicationType->id),
                            'name' => $applicationType->name,
                            'days' => $days,
                            'hours' => $remainderHours,
                            'amount' => $totalEarning,
                        ];
                    }
                    Log::info("Application ID:      {$app->id}, Overlapping Days: {$days}, Remainder Hours: {$remainderHours}");
                    Log::info("Earning Per Hour:    {$earningPerHour}");
                    Log::info("Total Earning:       {$totalEarning}");
                    Log::info("Total Leave Earnings:{$leaveEarnings}");
                }
            }
        }

        return [
            'paid_leaves' => $paidLeaves,
            'unpaid_leaves' => $unpaidLeaves,
            'leave_earnings' => $leaveEarnings,
        ];
    }
}
