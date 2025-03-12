<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\WorkHoursModel;
use App\Models\WorkGroupsModel;
use App\Models\WorkShiftsModel;
use App\Models\AttendanceLogsModel;

use App\Models\WorkDaysModel;
use App\Models\BranchesModel;
use App\Models\JobTitlesModel;
use App\Models\DepartmentsModel;
use App\Models\EmployeeRolesModel;
use App\Models\LeaveCreditsModel;
use App\Models\ApplicationsModel;
use App\Models\ApplicationTypesModel;
use App\Models\EmployeeBenefitsModel;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

use Carbon\Carbon;

class PayrollController extends Controller
{
    public function checkUser()
    {
        // Log::info("PayrollController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
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
        log::info("PayrollController::getGoogleCalendarHolidays");

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

        if ($this->checkUser()) {

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

                $perDay = $employee->salary / $numberOfWorkingDays;
                $perHour = $perDay / 8;
                $perMin = $perHour / 60;

                $deductionsForAbsent = $perDay * $numberOfAbsentDays;

                $grossPay = $employee->salary - $deductionsForAbsent;

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
                    'grossPay' => $grossPay,
                ];
            }

            return response()->json(['status' => 200, 'payrolls' => $payrolls]);
        }

        return response()->json(['status' => 200, 'payrolls' => null]);
    }

    public function payrollDetails(Request $request)
    {
        // log::info("PayrollController::payrollDetails");

        $startDate = $request->currentStartDate;
        $endDate = $request->currentEndDate;

        $employee = UsersModel::find($request->selectedPayroll);
        $employeeBenefits = EmployeeBenefitsModel::where('user_id', $employee->id)->get();
        $logs = AttendanceLogsModel::where('user_id', $employee->id)->whereBetween('timestamp', [$startDate, $endDate])->get();

        $employeeShare = 0;
        $employerShare = 0;

        $benefits = [];

        foreach ($employeeBenefits as $employeeBenefit) {

            // log::info("================================");
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

            // log::info("Type                     :" . $benefit->type);
            // log::info("Name                     :" . $benefit->name);
            // log::info("employeeShare            :" . $employeeAmount);
            // log::info("employerShare            :" . $employerAmount);

            $employeeShare += $employeeAmount;
            $employerShare += $employerAmount;

            $benefits[] = ['name' => $benefit->name, 'employeeAmount' => $employeeAmount, 'employerAmount' => $employerAmount];
        }

        $benefits[] = [
            'name' => "Total Benefits",
            'employeeAmount' => $employeeShare,
            'employerAmount' => $employerShare
        ];

        // log::info("================================");
        // log::info("Total Employee Share     :" . $employeeShare);
        // log::info("Total Employer Share     :" . $employerShare);

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

        $perCutOff = $employee->salary / 2;
        $perDay = $perCutOff / $numberOfWorkingDays;
        $perHour = $perDay / 8;
        $perMin = $perHour / 60;

        $absents = $perDay * $numberOfAbsentDays;

        // log::info("================================");
        // log::info("Cut Off       :" . $perCutOff);
        // log::info("Days          :" . $numberOfWorkingDays);

        // ============== WORK HOURS ==============
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $workHours = $employee->workHours;
        try {
            $firstIn = Carbon::createFromFormat('H:i:s', $workHours->first_time_in ?? '09:00:00');
            $firstOut = Carbon::createFromFormat('H:i:s', $workHours->first_time_out ?? '17:00:00');
            $breakStart = Carbon::createFromFormat('H:i:s', $workHours->break_start ?? '12:00:00');
            $breakEnd = Carbon::createFromFormat('H:i:s', $workHours->break_end ?? '13:00:00');
            $secondIn = Carbon::createFromFormat('H:i:s', $workHours->second_time_in ?? '14:00:00');
            $secondOut = Carbon::createFromFormat('H:i:s', $workHours->second_time_out ?? '22:00:00');
        } catch (\Carbon\Exceptions\InvalidFormatException $e) {
            //Log::error("Failed to parse work hours for user ID: {$employee->id}, Error: {$e->getMessage()}");
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

        // Log::info("================================");
        // Log::info("Shift Type    :" . $workHours->shift_type);
        // Log::info("Day Start     :" . $dayStart);
        // Log::info("Day End       :" . $dayEnd);
        // Log::info("Day-Gap Start :" . $gapStart);
        // Log::info("Day-Gap End   :" . $gapEnd);

        $totalWorkHours = $firstOut->diffInSeconds($firstIn) / 3600;
        if ($workHours->shift_type === 'Regular') {
            $totalWorkHours -= $breakEnd->diffInSeconds($breakStart) / 3600;
        } elseif ($workHours->shift_type === 'Split') {
            $totalWorkHours += $secondOut->diffInSeconds($secondIn) / 3600;
        }
        $hourlyRate = $perDay / $totalWorkHours;

        // Log::info("================================");
        // Log::info("Daily Pay      :" . $perDay);
        // Log::info("Hours Per Day  :" . $totalWorkHours);
        // Log::info("Hourly Rate    :" . $hourlyRate);

        // ============== LEAVES ==============
        $applicationTypes = ApplicationTypesModel::select('id', 'name', 'client_id', 'percentage', 'is_paid_leave')
            ->where('client_id', $employee->client_id)
            ->get();

        $paidLeaves = [];
        $unpaidLeaves = [];
        $leaveEarnings = 0;

        $applicationIds = $applicationTypes->pluck('id')->all();
        $applications = ApplicationsModel::select('id', 'type_id', 'duration_start', 'duration_end', 'status')
            ->where('user_id', $employee->id)
            ->whereIn('type_id', $applicationIds)
            ->where('status', 'Approved')
            ->where(function ($query) use ($startDate, $endDate) {
                $query->where('duration_start', '<=', $endDate)
                    ->where('duration_end', '>=', $startDate);
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
                // Log::info("================================");
                // Log::info("App Starts     :" . $fromDate);
                // Log::info("App Ends       :" . $toDate);

                $overlapStart = max($fromDate->startOfDay(), $start);
                $overlapEnd = min($toDate->startOfDay(), $end);

                $lastStart = $dayStart->copy()->setDateFrom($overlapEnd);
                $lastEnd = $dayEnd->copy()->setDateFrom($overlapEnd);
                $lastGapStart = $gapStart->copy()->setDateFrom($overlapEnd);
                $lastGapEnd = $gapEnd->copy()->setDateFrom($overlapEnd);

                if ($overlapStart <= $overlapEnd) {
                    $currentDate = $overlapStart->copy();
                    if ($overlapStart->isSameDay($overlapEnd)) {
                        // Log::info("================================");
                        // Log::info("Same Day Leave");
                        // Log::info("Current Date   :" . $currentDate);
                        $skipDay = $this->isExcludedDay($currentDate);
                        $skipDay = true;
                        if (!$skipDay) {
                            $totalHours = 0;
                        } else {
                            if ($fromDate->isAfter($dayEnd) || $toDate->isBefore($dayStart)) {
                                // No Affected Hours within day, exclude from count
                                $totalHours = 0;
                            } else {
                                $affectedStart = max($fromDate, $dayStart);
                                $affectedEnd = min($toDate, $dayEnd);
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

                    // Log::info("================================");
                    $days = floor($totalHours / $totalWorkHours);
                    $remainderHours = $totalHours % $totalWorkHours;
                    if ($applicationType->is_paid_leave) {
                        // Log::info("Paid Leave");
                        // Log::info("Leave Percentage:    {$applicationType->percentage}%");
                        $earningPerHour = $hourlyRate * ($applicationType->percentage / 100);
                        $totalEarning = $totalHours * $earningPerHour;
                        $leaveEarnings += $totalEarning;

                        $paidLeaves[] = [
                            'name' => $applicationType->name,
                            'days' => $days,
                            'hours' => $remainderHours,
                            'amount' => $totalEarning,
                        ];
                    } else {
                        // Log::info("Unpaid Leave");
                        $earningPerHour = $hourlyRate;
                        $totalEarning = $totalHours * $earningPerHour;
                        $leaveEarnings += $totalEarning;

                        $unpaidLeaves[] = [
                            'name' => $applicationType->name,
                            'days' => $days,
                            'hours' => $remainderHours,
                            'amount' => $totalEarning,
                        ];
                    }
                    // Log::info("Application ID:      {$app->id}, Overlapping Days: {$days}, Remainder Hours: {$remainderHours}");
                    // Log::info("Earning Per Hour:    {$earningPerHour}");
                    // Log::info("Total Earning:       {$totalEarning}");
                    // Log::info("Total Leave Earnings:{$leaveEarnings}");
                }
            }
        }

        // ============== RESPONSE PREP ==============
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
            'grossPay' => $employee->salary,
            'perCutOff' => $perCutOff,
            'perDay' => $perDay,
            'perMin' => $perMin,
            'employeeShare' => $employeeShare,
            'employerShare' => $employerShare,
        ];

        $basicPay = $perCutOff;
        $overTimePay = 0;
        $holidayPay = 0;

        $totalEarnings =  $basicPay + $overTimePay + $holidayPay;

        $earnings = [
            ['name' => 'Basic Pay', 'amount' => $basicPay],
            ['name' => 'Over Time Pay', 'amount' => $overTimePay],
            ['name' => 'Holiday Pay', 'amount' => $holidayPay],
            ['name' => 'Total Earnings', 'amount' => $totalEarnings],
        ];

        $tardiness = 0;
        $cashAdvance = 0;
        $loans = 0;
        $tax = 0;

        $totalDeductions =  $employeeShare + $absents + $tardiness + $cashAdvance + $loans + $tax - $leaveEarnings;

        $deductions = [
            // ['name' => 'Benefits', 'amount' => $employeeShare],
            ['name' => 'Absents', 'amount' => $absents],
            ['name' => 'Tardiness', 'amount' => $tardiness],
            ['name' => 'Cash Advance', 'amount' => $cashAdvance],
            ['name' => 'Loans', 'amount' => $loans],
            ['name' => 'Tax', 'amount' => $tax],
            ['name' => 'Total Deductions', 'amount' => $totalDeductions],
        ];

        $takeHomePay = $totalEarnings - $totalDeductions;

        $summaries = [
            ['name' => 'Total Earnings', 'amount' => $totalEarnings],
            ['name' => 'Total Deductions', 'amount' => $totalDeductions],
            ['name' => 'Net Pay', 'amount' =>  $takeHomePay],
        ];

        return response()->json([
            'status' => 200,
            'takeHomePay' => $takeHomePay,
            'payroll' => $payroll,
            'benefits' => $benefits,
            'earnings' => $earnings,
            'deductions' => $deductions,
            'summaries' => $summaries,
            'paid_leaves' => $paidLeaves,
            'unpaid_leaves' => $unpaidLeaves
        ]);
    }
}
