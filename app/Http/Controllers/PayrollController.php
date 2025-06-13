<?php

namespace App\Http\Controllers;

use App\Models\UsersModel;
use App\Models\ClientsModel;
use App\Models\PayslipsModel;
use App\Models\PayslipLeavesModel;
use App\Models\PayslipBenefitsModel;
use App\Models\PayslipEarningsModel;
use App\Models\PayslipDeductionsModel;
use App\Models\PayslipAllowancesModel;

use App\Models\ApplicationsModel;
use App\Models\AttendanceLogsModel;
use App\Models\ApplicationTypesModel;
use App\Models\EmployeeBenefitsModel;
use App\Models\EmployeeAllowancesModel;
use App\Models\ApplicationsOvertimeModel;

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
        // log::info("PayrollController::checkUserAdmin");

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
        // log::info("PayrollController::checkUserEmployee");

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
        // log::info("PayrollController::getNumberOfDays");

        // Initialize counters
        $numberOfDays = $startDate->diffInDays($endDate) + 1; // Include start and end date
        $numberOfSaturday = 0;
        $numberOfSunday = 0;
        $numberOfHoliday = 0;
        $numberOfHolidayWeekday = 0;

        // Fetch Philippine holidays from Nager.Date API
        // $holidays = $this->getNagerHolidaysWeekdays($startDate->year, $endDate->year);
        // $holidays = $this->getNagerHolidays($startDate->year, $endDate->year);

        $holidays = $this->getHolidaysWeekdays($startDate->year, $endDate->year);


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

    public function getHolidaysWeekdays()
    {
        $holidays = [
            [
                "date" => "2025-01-01",
                "localName" => "Bagong Taon",
                "name" => "New Year's Day",
            ],
            [
                "date" => "2025-01-29",
                "localName" => "Chinese New Year",
                "name" => "Chinese New Year",
            ],
            [
                "date" => "2025-04-01",
                "localName" => "Eid’l Fitr",
                "name" => "Feast of Ramadhan",
            ],
            [
                "date" => "2025-04-09",
                "localName" => "Araw ng Kagitingan",
                "name" => "Day of Valor",
            ],
            [
                "date" => "2025-04-17",
                "localName" => "Huwebes Santo",
                "name" => "Maundy Thursday",
            ],
            [
                "date" => "2025-04-18",
                "localName" => "Biyernes Santo",
                "name" => "Good Friday",
            ],
            [
                "date" => "2025-04-19",
                "localName" => "Sabado de Gloria",
                "name" => "Holy Saturday",
            ],
            [
                "date" => "2025-05-01",
                "localName" => "Araw ng Paggawa",
                "name" => "Labor Day",
            ],
            [
                "date" => "2025-05-12",
                "localName" => "Araw ng Eleksyon",
                "name" => "Election Day",
            ],
            [
                "date" => "2025-06-06",
                "localName" => "Aldâ al-Adhâ",
                "name" => "Eid al-Adha (Feast of the Sacrifice)",
            ],
            [
                "date" => "2025-06-12",
                "localName" => "Araw ng Kalayaan",
                "name" => "Independence Day",
            ],
            [
                "date" => "2025-08-21",
                "localName" => 'Araw ng Kamatayan ni Senador Benigno Simeon "Ninoy" Aquino Jr.',
                "name" => "Ninoy Aquino Day",
            ],
            [
                "date" => "2025-08-25",
                "localName" => "Araw ng mga Bayani",
                "name" => "National Heroes Day",
            ],
            [
                "date" => "2025-10-31",
                "localName" => "All Saints' Day Eve",
                "name" => "All Saints' Day Eve",
            ],
            [
                "date" => "2025-11-01",
                "localName" => "Araw ng mga Santo",
                "name" => "All Saints' Day",
            ],
            [
                "date" => "2025-11-30",
                "localName" => "Araw ni Gat Andres Bonifacio",
                "name" => "Bonifacio Day",
            ],
            [
                "date" => "2025-12-08",
                "localName" => "Kapistahan ng Immaculada Concepcion",
                "name" => "Feast of the Immaculate Conception of Mary",
            ],
            [
                "date" => "2025-12-24",
                "localName" => "Christmas Eve",
                "name" => "Christmas Eve",
            ],
            [
                "date" => "2025-12-25",
                "localName" => "Araw ng Pasko",
                "name" => "Christmas Day",
            ],
            [
                "date" => "2025-12-30",
                "localName" => "Araw ng Kamatayan ni Dr. Jose Rizal",
                "name" => "Rizal Day",
            ],
            [
                "date" => "2025-12-31",
                "localName" => "Huling Araw ng Taon",
                "name" => "Last Day of The Year",
            ],
        ];

        return collect($holidays)->filter(function ($holiday) {
            return Carbon::parse($holiday['date'])->isWeekday();
        })->pluck('date')->toArray();
    }


    public function getNagerHolidays($startYear, $endYear)
    {
        // log::info("PayrollController::getNagerHolidays");

        $holidays = [];
        $countryCode = 'PH';

        // Fetch holidays for each year in the range
        for ($year = $startYear; $year <= $endYear; $year++) {
            $url = "https://date.nager.at/api/v3/PublicHolidays/{$year}/{$countryCode}";

            $response = Http::get($url);

            if ($response->successful()) {
                $data = $response->json();

                // Log the API response for debugging
                // log::info("Nager.Date API Response for {$year}: " . json_encode($data));

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

    public function getNagerHolidaysWeekdays($startYear, $endYear)
    {
        // log::info("PayrollController::getNagerHolidaysWeekdays");

        $holidays = [];
        $countryCode = 'PH';

        // Fetch holidays for each year in the range
        for ($year = $startYear; $year <= $endYear; $year++) {
            $url = "https://date.nager.at/api/v3/PublicHolidays/{$year}/{$countryCode}";

            $response = Http::get($url);

            if ($response->successful()) {
                $data = $response->json();

                // Ensure $data is an array before iterating
                if (is_array($data)) {
                    foreach ($data as $holiday) {
                        $holidayDate = Carbon::parse($holiday['date']);

                        // Check if the holiday falls on a weekday (Monday to Friday)
                        if ($holidayDate->isWeekday()) {
                            $holidays[] = $holidayDate->format('Y-m-d');
                        }
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
        log::info("PayrollController::payrollProcess");
        log::info($request);

        $user = Auth::user();

        if ($this->checkUserAdmin()) {

            $request->validate([
                'startDate' => 'required|date',
                'endDate' => 'required|date|after_or_equal:startDate',
            ]);

            $startDate = $request->startDate;
            $endDate = $request->endDate;

            $employees = UsersModel::where(function ($query) use ($startDate, $endDate, $request) {
                $query->whereHas('attendanceLogs', function ($subQuery) use ($startDate, $endDate) {
                    $subQuery->whereBetween('timestamp', [$startDate, $endDate]);
                })->orWhere('is_fixed_salary', true);
            })
            ->where('client_id', $user->client_id)
            ->whereIn('branch_id', $request->branches)
            ->whereIn('department_id', $request->departments)
            ->get();

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

                // log::info("==============================================");
                // log::info("numberOfWorkingDays: . $numberOfWorkingDays");
                // log::info("numberOfDays: . $numberOfDays");
                // log::info("numberOfSaturday: . $numberOfSaturday");
                // log::info("numberOfSunday: . $numberOfSunday");
                // log::info("numberOfHoliday: . $numberOfHoliday");

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
        // log::info("PayrollController::calculateTax");

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

        // log::info("==================================");
        // log::info("salary               :" . $salary);
        // log::info("contribution         :" . $contribution);
        // log::info("withholdingTax       :" . $withholdingTax);
        // log::info("==================================");

        // log::info("==================================");
        // log::info("taxableIncome        :" . $taxableIncome);
        // log::info("compensationLevel    :" . $compensationLevel);
        // log::info("==================================");

        $percentage = $withholdingTax / 100;
        $incomeTax = ($taxableIncome - $compensationLevel) * $percentage;
        // log::info("==================================");
        // log::info("percentage           :" . $salary);
        // log::info("incomeTax            :" . $incomeTax);
        // log::info("==================================");

        return $incomeTax;
    }

    public function calculateHolidayPay($logs, $perMin)
    {
        // Log::info("PayrollController::calculateHolidayPay");

        $holidayLogs = [];
        $holidays = [
            ['name' => 'New Year’s Day', 'date' => '2025-01-01'],
            ['name' => 'Maundy Thursday', 'date' => '2025-04-17'],
            ['name' => 'Good Friday', 'date' => '2025-04-18'],
            ['name' => 'Araw ng Kagitingan', 'date' => '2025-04-09'],
            ['name' => 'Labor Day', 'date' => '2025-05-01'],
            ['name' => 'Eid al-Adha (Feast of the Sacrifice)', 'date' => '2025-06-06'],
            ['name' => 'Independence Day', 'date' => '2025-06-12'],
            ['name' => 'National Heroes Day', 'date' => '2025-08-25'],
            ['name' => 'Bonifacio Day', 'date' => '2025-11-30'],
            ['name' => 'Christmas Day', 'date' => '2025-12-25'],
            ['name' => 'Rizal Day', 'date' => '2025-12-30'],
            ['name' => 'Chinese New Year', 'date' => '2025-01-29'],
            ['name' => 'EDSA People Power Revolution Anniversary', 'date' => '2025-02-25'],
            ['name' => 'Black Saturday', 'date' => '2025-04-19'],
            ['name' => 'Ninoy Aquino Day', 'date' => '2025-08-21'],
            ['name' => 'All Saints’ Day', 'date' => '2025-11-01'],
            ['name' => 'Feast of the Immaculate Conception of Mary', 'date' => '2025-12-08'],
            ['name' => 'Christmas Eve', 'date' => '2025-12-24'],
            ['name' => 'New Year’s Eve', 'date' => '2025-12-31'],
            ['name' => 'Eid’l Fitr', 'date' => '2025-03-31'],
            ['name' => 'Eid’l Adha', 'date' => '2025-06-06'],
        ];

        
        foreach ($logs as $log) {
            $logDate = Carbon::parse($log['timestamp'])->format('Y-m-d');

            foreach ($holidays as $holiday) {
                if ($logDate === $holiday['date']) {
                    $holidayLog = (object) $log;
                    $holidayLogs[] = $holidayLog;
                    break;
                }
            }
        }

        $timeIn = "";
        $timeOut = "";
        $overTimeIn = "";
        $overTimeOut = "";

        $morning = 0;
        $afternoon = 0;
        $overtime = 0;
        
        foreach ($holidayLogs as $log) {
            switch ($log->action) {
                case 'Duty In':
                    $timeIn = $log->timestamp;
                    break;

                case 'Duty Out':
                    $timeOut = $log->timestamp;
                    break;

                case 'Overtime In':
                    $overTimeIn = $log->timestamp;
                    break;

                case 'Overtime Out':
                    $overTimeOut = $log->timestamp;
                    break;
            }
        }

        // Log::info("Time In: " . $timeIn);
        // Log::info("Time Out: " . $timeOut);
        // Log::info("Overtime In: " . $overTimeIn);
        // Log::info("Overtime Out: " . $overTimeOut);

        if ($timeIn && $timeOut) {
            $timeInCarbon = Carbon::parse($timeIn);
            $timeOutCarbon = Carbon::parse($timeOut);

            $morningStart = $timeInCarbon->copy()->setTime(8, 30);
            $morningEnd   = $timeInCarbon->copy()->setTime(12, 0);

            $afternoonStart = $timeInCarbon->copy()->setTime(13, 0);
            $afternoonEnd   = $timeInCarbon->copy()->setTime(17, 30);

            $actualStart = $timeInCarbon->greaterThan($morningStart) ? $timeInCarbon : $morningStart;
            $actualEnd = $timeOutCarbon->lessThan($morningEnd) ? $timeOutCarbon : $morningEnd;
            if ($actualStart < $actualEnd) {
                $morning = $actualStart->diffInMinutes($actualEnd);
            }

            $actualStart = $timeInCarbon->greaterThan($afternoonStart) ? $timeInCarbon : $afternoonStart;
            $actualEnd = $timeOutCarbon->lessThan($afternoonEnd) ? $timeOutCarbon : $afternoonEnd;
            if ($actualStart < $actualEnd) {
                $afternoon = $actualStart->diffInMinutes($actualEnd);
            }
        }

        if ($overTimeIn && $overTimeOut) {
            $overtimeInCarbon = Carbon::parse($overTimeIn);
            $overtimeOutCarbon = Carbon::parse($overTimeOut);

            $overtimeStart = $overtimeInCarbon->copy()->setTime(17, 30);
            $overtimeEnd   = $overtimeInCarbon->copy()->setTime(22, 0);

            $actualStart = $overtimeInCarbon->greaterThan($overtimeStart) ? $overtimeInCarbon : $overtimeStart;
            $actualEnd = $overtimeOutCarbon->lessThan($overtimeEnd) ? $overtimeOutCarbon : $overtimeEnd;

            if ($actualStart < $actualEnd) {
                $overtime = $actualStart->diffInMinutes($actualEnd);
            }
        }

        $totalMinutes = $morning + $afternoon;

        
        Log::info("Total rendered minutes: $totalMinutes");
        Log::info("Per Minute: $perMin");

        $holidayPay = $totalMinutes * $perMin;
        $holidayOTPay = $overtime * $perMin * 2 * 1.3;


        Log::info("Overtime rendered minutes: $overtime");



        // $distinctDays = collect($holidayLogs)->groupBy(function ($log) {
        //     return Carbon::parse($log->timestamp)->toDateString();
        // });

        // foreach ($distinctDays as $log) {
            // Log::info($log);
        // }

        return [ 'holidayPay' => $holidayPay, 'holidayOTPay' => $holidayOTPay, 'holidayOTMins' => $overtime ];
    }

    public function payrollDetails(Request $request)
    {
        // log::info("PayrollController::payrollDetails");
        // log::info($request);

        $startDate = $request->currentStartDate;
        $endDate = $request->currentEndDate;
        $cutOff = $request->cutOff;

        $employee = UsersModel::with('workHours')->find($request->selectedPayroll);
        $employeeBenefits = EmployeeBenefitsModel::where('user_id', $employee->id)->get();
        $logs = AttendanceLogsModel::where('user_id', $employee->id)->whereBetween('timestamp', [$startDate, $endDate])->get();
        $client = ClientsModel::find($employee->client_id);

        $employeeShare = 0;
        $employerShare = 0;

        $benefits = [];

        // ============== BENEFITS ==============
        foreach ($employeeBenefits as $employeeBenefit) {
            $benefit = $employeeBenefit->benefit;

            $employeeAmount = 0;
            $employerAmount = 0;

            if ( $cutOff == "First" && $client->id != 4 && $benefit->type == "Percentage") {
                $employeeAmount = $employee->salary * ($benefit->employee_percentage / 100);
                $employerAmount = $employee->salary * ($benefit->employer_percentage / 100);
            }

            if ( $cutOff == "First" && $client->id != 4 && $benefit->type == "Amount") {
                $employeeAmount = $benefit->employee_amount * 1;
                $employerAmount = $benefit->employer_amount * 1;
            }

            if ( $cutOff == "Second" && $client->id == 4 && $benefit->type == "Percentage") {
                $employeeAmount = $employee->salary * ($benefit->employee_percentage / 100);
                $employerAmount = $employee->salary * ($benefit->employer_percentage / 100);

                if ( $benefit->id == 3 && $employee->salary < 15000 ){
                    $employerAmount = $employerAmount + 10;
                }

                if ( $benefit->id == 3 && $employee->salary >= 15000 ){
                    $employerAmount = $employerAmount + 30;
                }
            }

            if ( $cutOff == "Second" && $client->id == 4 && $benefit->type == "Amount") {
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
        $numberOfAbsentDays = max(0, $numberOfWorkingDays - $numberOfPresent);

        // log::info("===========================");
        // log::info("numberOfDays         : " . $numberOfDays);
        // log::info("numberOfSaturday     : " . $numberOfSaturday);
        // log::info("numberOfSunday       : " . $numberOfSunday);
        // log::info("numberOfHoliday      : " . $numberOfHoliday);
        // log::info("numberOfWorkingDays  : " . $numberOfWorkingDays);
        // log::info("numberOfAbsentDays   : " . $numberOfAbsentDays);
        // log::info("===========================");

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
        $daysOnLeave = 0;

        $leaveParams = [
            'employee_id' => $employee->id,
            'client_id' => $employee->client_id,
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

        $leaveDeductions = $this->getLeaves($leaveParams);
        $paidLeaves = $leaveDeductions['paid_leaves'];
        $unpaidLeaves = $leaveDeductions['unpaid_leaves'];
        $leaveEarnings = $leaveDeductions['leave_earnings'];

        foreach ($unpaidLeaves as $unpaidLeave) {
            $daysOnLeave += $unpaidLeave['days'];
        }

        foreach ($paidLeaves as $paidLeave) {
            $daysOnLeave += $paidLeave['days'];
        }

        // ============== RESPONSE PREP ==============
        $totalOvertime = $this->getAttendanceOvertime($startDate, $endDate, $employee->id);

        $basicPay = $perCutOff - $leaveEarnings;
        $overTimePay = ($perMin * 1.25) * $totalOvertime;

        $holidayPays = $this->calculateHolidayPay($logs, $perMin);
        $holidayPay = $holidayPays['holidayPay'];
        $holidayOTPay = $holidayPays['holidayOTPay'];
        $holidayOTMins = $holidayPays['holidayOTMins'];

        $earnings = [
            ['earning' => '1', 'name' => 'Basic Pay', 'amount' => $basicPay],
            ['earning' => '2', 'name' => "Over Time Pay ({$totalOvertime} mins)", 'amount' => $overTimePay],
            ['earning' => '3', 'name' => 'Holiday Pay', 'amount' => $holidayPay],
            ['earning' => '4', 'name' => "Holiday OT Pay ({$holidayOTMins} mins)", 'amount' => $holidayOTPay],
        ];

        $tardiness = 0;
        $cashAdvance = 0;
        $loans = 0;

        $tax = $this->calculateTax($employee->salary, $employeeShare);
        // log::info("Returned Tax: " . $tax);

        $tardinessTime = $this->getTardiness($startDate, $endDate, $employee->id);

        if ($employee->is_fixed_salary == 0) {
            $absents = $absents - $leaveEarnings;
            $tardiness = $perMin * $tardinessTime;
        } else {
            $absents = 0;
            $tardiness = 0;
            $numberOfAbsentDays = 0;
            $tardinessTime = 0;
        }

        $allowances = [];
        $totalAllowance = 0;

        $rawAllowance = EmployeeAllowancesModel::where('user_id', $employee->id)->get();

        foreach ( $rawAllowance as $allowance ) {
            $totalAllowance = $totalAllowance + $allowance->allowance->amount;

            $allowances[] = [
                'allowance' => encrypt($allowance->id),
                'name' => $allowance->allowance->name,
                'amount' => $allowance->allowance->amount,
            ];
        }

        $totalEarnings =  $basicPay + $overTimePay + $holidayPay + $holidayOTPay - $absents + $leaveEarnings - $tardiness + $totalAllowance;
        $totalDeductions =  $employeeShare + $cashAdvance + $loans + $tax;

        $payroll = [
            'employeeId' => $employee->user_name,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'cutOff' => $cutOff,
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
            ['deduction' => '1', 'name' => "Absents (" . ($numberOfAbsentDays - $daysOnLeave) . " days)", 'amount' => $absents],
            ['deduction' => '2', 'name' => "Tardiness ({$tardinessTime} mins)", 'amount' => $tardiness],
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
            'allowances' => $allowances,
            'deductions' => $deductions,
            'summaries' => $summaries,
            'paid_leaves' => $paidLeaves,
            'unpaid_leaves' => $unpaidLeaves,
        ]);
    }

    public function savePayroll(Request $request)
    {
        // log::info("PayrollController::savePayroll");
        // log::info($request);

        $user = Auth::user();

        $payrollRequest = new Request(['selectedPayroll' => $request->selectedPayroll, 'currentStartDate' => $request->currentStartDate, 'currentEndDate' => $request->currentEndDate, 'cutOff' => $request->cutOff]);

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
                "cut_off" => $request->cutOff,
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

            foreach ($payrollData['allowances'] as $allowance) {
                if ($allowance['name'] != "Total Benefits") {
                    $newAllowance = PayslipAllowancesModel::create(["payslip_id" => $payslip->id, "employee_allowance_id" => decrypt($allowance['allowance']), "amount" => $allowance['amount']]);
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
        // log::info("PayrollController::savePayrolls");
        // log::info($request);

        $currentStartDate = $request->currentStartDate;
        $currentEndDate = $request->currentEndDate;

        foreach ($request->selectedPayrolls as $selectedPayroll) {
            $payrollRequest = new Request(['selectedPayroll' => $selectedPayroll, 'currentStartDate' => $currentStartDate, 'currentEndDate' => $currentEndDate, 'cutOff' => $request->cutOff]);

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
                    // 'employeeName' => $employee->first_name . ' ' . $employee->middle_name . ' ' . $employee->last_name . ' ' . $employee->suffix,
                    'employeeName' => $employee->last_name . ', ' . $employee->first_name . ' ' . $employee->middle_name . ' ' . $employee->suffix,
                    'employeeBranch' => $employee->branch->name ?? '-',
                    'employeeDepartment' => $employee->department->name ?? '-',
                    'employeeRole' => $employee->role->name ?? '-',
                    'payrollStartDate' => $rawRecord->period_start ?? '-',
                    'payrollEndDate' => $rawRecord->period_end ?? '-',
                    'payrollCutOff' => $rawRecord->cut_off ?? '-',
                    'payrollWorkingDays' => $rawRecord->working_days ?? '-',
                    'payrollGrossPay' => $rawRecord->rate_monthly ?? '-',
                ];
            }

            $records = collect($records)->sortBy('employeeName')->values()->all();
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
            $allowances = [];
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

            foreach ($record->allowances as $allowance) {
                $allowances[] = [
                    'name' => $allowance->employeeAllowance->allowance->name,
                    'amount' => $allowance->employeeAllowance->allowance->amount,
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
                    case 4:
                        $name = 'Holiday OT Pay';
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

            foreach ($record->paidLeaves as $paidLeave  ) {
                $paid_leaves[] = [
                    'name' => $paidLeave->applicationType->name,
                    'amount' => $paidLeave->amount,
                ];
            }

            foreach ($record->unpaidLeaves as $unpaidLeave  ) {
                $unpaid_leaves[] = [
                    'name' => $unpaidLeave->applicationType->name,
                    'amount' => $unpaidLeave->amount,
                ];
            }

            $summaries = [
                ['name' => 'Total Earnings', 'amount' => $record->total_earnings],
                ['name' => 'Total Deductions', 'amount' => $record->total_deductions],
                ['name' => 'Net Pay', 'amount' =>  $record->total_earnings - $record->total_deductions],
            ];

            return response()->json(['status' => 200, 'payslip' => $payslip, 'benefits' => $benefits, 'allowances' => $allowances, 'deductions' => $deductions, 'earnings' => $earnings, 'paid_leaves' => $paid_leaves, 'unpaid_leaves' => $unpaid_leaves, 'summaries' => $summaries]);
        }
    }

    public function getPayrollSummary()
    {
        // log::info("PayrollController::getPayrollSummary");

        if ($this->checkUserAdmin()) {
            $user = Auth::user();

            $rawRecords = PayslipsModel::where('client_id', $user->client_id)->get();

            $records = [];

            foreach ($rawRecords as $rawRecord) {
                $employee = UsersModel::find($rawRecord->employee_id);
                $overTime = PayslipEarningsModel::where('payslip_id', $rawRecord->id)->where('earning_id', 2)->first();
                $absences = PayslipDeductionsModel::where('payslip_id', $rawRecord->id)->where('deduction_id', 1)->first();
                $tardiness = PayslipDeductionsModel::where('payslip_id', $rawRecord->id)->where('deduction_id', 2)->first();

                $hourlyRate = $rawRecord->rate_hourly;
                $dailyRate = $rawRecord->rate_daily;
                $overTimeRate = $hourlyRate * 1.25;
                $overTimeHours = 0;

                $paidLeaveDays = 0;
                $paidLeaveAmount = 0;
                $totalAllowance = 0;

                foreach ( $rawRecord->paidLeaves as $padiLeave ) {
                    $amount = $padiLeave->amount;

                    $percentage = $padiLeave->applicationType->percentage / 100;
                    $dailyRateOT = $dailyRate * $percentage;

                    $days = $amount / $dailyRateOT;
                    
                    $paidLeaveDays = $paidLeaveDays + $days;
                    $paidLeaveAmount = $paidLeaveAmount + $amount;
                }

                foreach ( $rawRecord->allowances as $allowance ) {
                    $totalAllowance = $totalAllowance + $allowance->amount;
                }

                if ( $overTime->amount != 0 ){
                    $overTimeHours = round($overTime->amount / $overTimeRate);
                }

                $holidayPay = PayslipEarningsModel::where('payslip_id', $rawRecord->id)->where('earning_id', 3)->value('amount');
                $holidayOvertime = PayslipEarningsModel::where('payslip_id', $rawRecord->id)->where('earning_id', 4)->value('amount');


                // Getting of Static Statury Beneftis
                // log::info("====================================================================================================");
                $sssEmployee = 0;
                $sssEmployer = 0;

                $philHealthEmployee = 0;
                $philHealthEmployer = 0;

                $pagIbigEmployee = 0;
                $pagIbigEmployer = 0;

                $benefits = PayslipBenefitsModel::where('payslip_id', $rawRecord->id)->get();

                foreach ($benefits as $benefit) {
                    // log::info("====================================================================================================");
                    if ($benefit->benefit_id == 3) {
                        $sssEmployee = $benefit->employee_amount;
                        $sssEmployer = $benefit->employer_amount;
                    }

                    if ($benefit->benefit_id == 4) {
                        $philHealthEmployee = $benefit->employee_amount;
                        $philHealthEmployer = $benefit->employer_amount;
                    }

                    if ($benefit->benefit_id == 5) {
                        $pagIbigEmployee = $benefit->employee_amount;
                        $pagIbigEmployer = $benefit->employer_amount;
                    }
                }


                $records[] = [
                    'key' => $rawRecord->id . $rawRecord->employee_id,
                    'record' => encrypt($rawRecord->id),
                    'employeeName' => $employee->last_name . ', ' . $employee->first_name . ' ' . $employee->middle_name . ' ' . $employee->suffix,
                    
                    // Monthly Base
                    'monthlyBaseHours' => $rawRecord->working_days * 8,
                    'monthlyBasePay' => ($rawRecord->rate_monthly / 2) - $paidLeaveAmount,

                    // Overtime
                    'overTimeHours' => $overTimeHours,
                    'overTimePay' => $overTime->amount,

                    'holidayPay' => $holidayPay,
                    'holidayOvertime' => $holidayOvertime,

                    // Paid Leave
                    'paidLeaveDays' => round($paidLeaveDays),
                    'paidLeaveAmount' => $paidLeaveAmount,

                    // Allowance
                    'totalAllowance' => $totalAllowance,

                    'absences' => $absences->amount,
                    'tardiness' => $tardiness->amount,

                    'sssEmployee' => $sssEmployee,
                    'sssEmployer' => $sssEmployer,

                    'philHealthEmployee' => $philHealthEmployee,
                    'philHealthEmployer' => $philHealthEmployer,

                    'pagIbigEmployee' => $pagIbigEmployee,
                    'pagIbigEmployer' => $pagIbigEmployer,

                    'payrollStartDate' => $rawRecord->period_start,
                    'payrollEndDate' => $rawRecord->period_end,
                    'payrollCutOff' => $rawRecord->cut_off,
                    'payrollWorkingDays' => $rawRecord->working_days,
                    'payrollGrossPay' => round($rawRecord->total_earnings + $absences->amount + $tardiness->amount, 2),
                    'payrollNetPay' => round($rawRecord->total_earnings - $rawRecord->total_deductions, 2)
                ];
            }

            $records = collect($records)->sortBy('employeeName')->values()->all();
            return response()->json(['status' => 200, 'records' => $records]);
        }

        return response()->json(['status' => 200, 'employees' => null]);
    }

    public function getTardiness($start_date, $end_date, $employeeId)
    {
        // log::info("Retrieving Tardiness");
        $user = Auth::user();

        $holidayWeekdays = $this->getHolidaysWeekdays();

        $logs = AttendanceLogsModel::with('workHour')
            ->where('user_id', $employeeId)
            ->whereBetween('timestamp', [$start_date . ' 00:00:00', $end_date . ' 23:59:59'])
            ->whereNotIn(DB::raw("DATE(timestamp)"), $holidayWeekdays) // exclude holiday weekdays
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

    public function getAttendanceOvertime($start_date, $end_date, $employeeId)
    {
        // Log::info("AttendanceController::getAttendanceOvertime");

        $user = Auth::user();

        $totalOvertimeMinutes = ApplicationsOvertimeModel::where('status', 'Approved')
            ->where('client_id', $user->client_id)
            ->where('user_id', $employeeId)
            ->whereBetween('date', [ date('Y-m-d', strtotime($start_date)), date('Y-m-d', strtotime($end_date)) ])
            ->sum('approved_minutes');
    
        return $totalOvertimeMinutes;
    }
    
    public function storeSignature(Request $request, $id)
    {
        // log::info("PayrollController::storeSignature");
        // log::info("Processing signature for payslip ID: {$id}");

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
                // log::info("PayrollController::storeSignature - Signature already exists for payslip ID: {$decryptedId}");
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

            // log::info("PayrollController::storeSignature - Signature saved successfully for payslip ID: {$decryptedId}, Filepath: {$filePath}");

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

    public function getLeaves(array $params)
    {
        // log::info("PayrollController::getLeaves");

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

                $overlapStart = max($fromDate->startOfDay(), $start);
                $overlapEnd = min($toDate->startOfDay(), $end);

                $lastStart = $dayStart->copy()->setDateFrom($overlapEnd);
                $lastEnd = $dayEnd->copy()->setDateFrom($overlapEnd);
                $lastGapStart = $gapStart->copy()->setDateFrom($overlapEnd);
                $lastGapEnd = $gapEnd->copy()->setDateFrom($overlapEnd);

                if ($overlapStart <= $overlapEnd) {
                    $currentDate = $overlapStart->copy();
                    if ($overlapStart->isSameDay($overlapEnd)) {
                        // log::info("================================");
                        // log::info("Same Day Leave");
                        // log::info("Current Date   :" . $currentDate);
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
                        // log::info("================================");
                        // log::info("Multi Day Leave");
                        while ($currentDate->lessThanOrEqualTo($overlapEnd)) {
                            //log::info("Current Date   :" . $currentDate);
                            $affectedTime = 0;

                            $skipDay = true;
                            if (!$skipDay) {
                                $totalHours = 0;
                            } else {
                                $appStart = Carbon::parse($app->duration_start)->setDateFrom(now());
                                $appEnd = Carbon::parse($app->duration_end);
                                if ($currentDate->greaterThan($fromDate) && $currentDate->lessThan($toDate)) {
                                    //log::info("Full Day");
                                    $affectedTime = $totalWorkHours;
                                } elseif ($currentDate->isSameDay($fromDate) && !$appStart->isAfter($dayEnd)) {
                                    $affectedStart = max($appStart, $dayStart);
                                    $affectedTime = $dayEnd->diffInSeconds($affectedStart) / 3600;

                                    if ($affectedStart->lessThan($gapStart)) {
                                        $affectedTime -= $gapEnd->diffInSeconds($gapStart) / 3600;
                                    } elseif ($affectedStart->lessThan($gapEnd)) {
                                        $affectedTime -= $gapEnd->diffInSeconds($affectedStart) / 3600;
                                    }
                                    //log::info("First Day:           {$affectedTime}");
                                } elseif ($currentDate->isSameDay($toDate) && !$appEnd->isBefore($lastStart)) {
                                    $affectedEnd = min($appEnd, $lastEnd);
                                    $affectedTime = $affectedEnd->diffInSeconds($lastStart) / 3600;

                                    if ($affectedEnd->greaterThan($lastGapEnd)) {
                                        $affectedTime -= $lastGapEnd->diffInSeconds($lastGapStart) / 3600;
                                    } elseif ($affectedEnd->greaterThan($lastGapStart)) {
                                        $affectedTime -= $affectedEnd->diffInSeconds($lastGapStart) / 3600;
                                    }
                                    //log::info("Last Day:            {$affectedTime}");
                                }
                                $affectedTime = max(0, $affectedTime);
                            }

                            $totalHours += $affectedTime;
                            $currentDate->addDay();
                        }
                    }

                    // log::info("================================");
                    $days = floor($totalHours / $totalWorkHours);
                    $remainderHours = $totalHours % $totalWorkHours;

                    if ($applicationType->is_paid_leave) {
                        // log::info("Paid Leave");
                        // log::info("Leave Percentage:    {$applicationType->percentage}%");
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
                        // log::info("Unpaid Leave");
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
                    // log::info("Application ID:      {$app->id}, Overlapping Days: {$days}, Remainder Hours: {$remainderHours}");
                    // log::info("Earning Per Hour:    {$earningPerHour}");
                    // log::info("Total Earning:       {$totalEarning}");
                    // log::info("Total Leave Earnings:{$leaveEarnings}");
                }
            }
        }

        return [
            'paid_leaves' => $paidLeaves,
            'unpaid_leaves' => $unpaidLeaves,
            'leave_earnings' => $leaveEarnings,
        ];
    }

    public function deletePayslip(Request $request)
    {
        // log::info("PayrollController::deletePayslip");
        
        $payslip = PayslipsModel::find(decrypt($request->uid));

        if ($payslip) {
            $payslip->delete();

            return response()->json(['status' => 200, 'message' => 'Payslip soft-deleted.']);
        }

        return response()->json(['status' => 404, 'message' => 'Payslip not found.']);
    }
}
