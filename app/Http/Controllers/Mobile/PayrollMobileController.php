<?php

namespace App\Http\Controllers\Mobile;

use App\Models\HrApplication;
use App\Models\HrApplicationList;
use App\Models\HrEmployeeBenefitsList;
use App\Models\HrPayrollAllRecord;
use App\Models\HrPayrollBenefit;
use App\Models\HrPayrollEarning;
use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PayrollMobileController extends Controller
{
    public function index($id)
    {
        $payrollAllRecord = HrPayrollAllRecord::findOrFail($id);
        return response()->json([
            'payrollAllRecord' => $payrollAllRecord
        ], 200);
    }

    public function getMemberPayrollRecord($year)
    {
        try {       
            $user = Auth::user();

            $payrollAllRecords = HrPayrollAllRecord::where('emp_id', $user->user_id)
                ->whereYear('payroll_todate', $year)
                ->get();

            Log::info($payrollAllRecords);

            return response()->json([
                'payrollAllRecord' => $payrollAllRecords
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'An error occurred'
            ], 500);
        }
    }

    public function getMemberPayrollRecordAll()
    {
        try {       
            $user = Auth::user();

            // Fetch payroll records for the authenticated user with only the required fields
            $payrollAllRecords = HrPayrollAllRecord::where('emp_id', $user->user_id)
                ->select('payroll_fromdate', 'payroll_todate', 'payroll_id', 'signature')
                ->get();

            // Log the retrieved records
            Log::info("PayrollRecords for user {$user->user_id}: ", $payrollAllRecords->toArray());

            // Check if records are found
            if ($payrollAllRecords->isEmpty()) {
                return response()->json([
                    'message' => 'No payroll records found for this user.'
                ], 404);
            }

            // Return the payroll records in the response
            return response()->json([
                'payrollAllRecord' => $payrollAllRecords
            ], 200);
        } catch (\Exception $e) {
            // Log the exception message
            Log::error("Error retrieving payroll records: {$e->getMessage()}");

            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'An error occurred'
            ], 500);
        }
    }


    public function  getPayrollRecordBenefits($id)
    { 
        try {
            $user = Auth::user();

            $allRecordsData = HrPayrollAllRecord::where('payroll_id', $id)
                ->where('is_deleted', 0)
                ->firstOrFail();

            $basicPay = $allRecordsData->basic_pay;
            $incentives = $allRecordsData->incentives;
            $allowance = $allRecordsData->allowance;
            $absences = $allRecordsData->absences;
            $tardiness = $allRecordsData->tardiness;
            $undertime = $allRecordsData->undertime;
            
            // Get earnings list
            $earningsList = HrPayrollEarning::where('payroll_id', $id)
                ->where('is_deleted', 0)
                ->where('status', 'Approved')
                ->get();

            // Log the earnings list for debugging
            Log::info('earningsList: ' . json_encode($earningsList));

            // Get applications list indexed by applist_id
            $applicationsList = HrApplicationList::where('is_deleted', 0)
                // ->where('team', $user->team) Filtering for team (web doesn't filter by team)
                ->pluck('list_name', 'applist_id'); // Pluck list_name with applist_id as key

            // Log the applications list for debugging
            Log::info('applicationsList: ' . json_encode($applicationsList));

            // Initialize arrays to store list names and total earnings
            $listNames[] = "Basic Pay";
            $totalEarnings[] = (float) $basicPay;
            $totalPay  = (float) $basicPay;

            // Loop through $earningsList to separate earnings with list_name
            foreach ($earningsList as $earning) {
                $listName = $applicationsList[$earning->applist_id] ?? null; // Get list_name from applicationsList

                if ($listName !== null) {
                    // Add to arrays
                    if (isset($totalEarnings[$listName])) {
                        $totalEarnings[$listName] += $earning->total_earnings;
                        $totalPay += $earning->total_earnings;
                    } else {
                        $listNames[] = $listName;
                        $totalEarnings[$listName] = $earning->total_earnings;
                        $totalPay += $earning->total_earnings;
                    }
                }
            }

            $listNames[] = "Incentives";
            $totalEarnings[] = (float) $incentives;
            $totalPay += (float) $incentives;

            $listNames[] = "Allowance";
            $totalEarnings[] = (float) $allowance;
            $totalPay += (float) $allowance;

            $listNames[] = "Absences";
            $totalEarnings[] = (float) $absences;
            $totalPay -= (float) $allowance;

            $listNames[] = "Tardiness";
            $totalEarnings[] = (float) $tardiness;
            $totalPay -= (float) $allowance;

            $listNames[] = "Undertime";
            $totalEarnings[] = (float) $undertime;
            $totalPay -= (float) $allowance;

            // Log the combined earnings
            Log::info('Combined earnings listNames: ' . json_encode($listNames));
            Log::info('Combined earnings totalEarnings: ' . json_encode($totalEarnings));
            
            // Initialize arrays for benefits, contributions, loans, and taxes
            $benefitsListNames = [];
            $benefitsListValues = [];
            $contributionsListNames = [];
            $contributionsListValues = [];
            $loansListNames = [];
            $loansListValues = [];
            $taxesListNames = [];
            $taxesListValues = [];

            // Fetch benefits data
            $benefitsData = HrPayrollBenefit::where('payroll_id', $id)
                ->where('type', 1) // Type 1 for benefits
                ->get();

            foreach ($benefitsData as $benefit) {
                // Fetch title from HrEmployeeBenefitsList using benefitlist_id
                $benefitList = HrEmployeeBenefitsList::find($benefit->benefitlist_id);
                if ($benefitList) {
                    $benefitsListNames[] = $benefitList->title;
                    $benefitsListValues[] = (float) $benefit->totalAmount;
                }
            }

            // Log the structured benefits for debugging
            Log::info('benefitsListNames: ' . json_encode($benefitsListNames));
            Log::info('benefitsListValues: ' . json_encode($benefitsListValues));

            // Fetch contributions data
            $contributionsData = HrPayrollBenefit::where('payroll_id', $id)
                ->where('type', 3) // Type 3 for contributions
                ->get();

            foreach ($contributionsData as $contribution) {
                // Fetch title from HrEmployeeBenefitsList using benefitlist_id
                $contributionList = HrEmployeeBenefitsList::find($contribution->benefitlist_id);
                if ($contributionList) {
                    $contributionsListNames[] = $contributionList->title;
                    $contributionsListValues[] = (float) $contribution->totalAmount;
                }
            }

            // Log the structured contributions for debugging
            Log::info('contributionsListNames: ' . json_encode($contributionsListNames));
            Log::info('contributionsListValues: ' . json_encode($contributionsListValues));

            // Fetch loans data
            $loansData = HrPayrollBenefit::where('payroll_id', $id)
                ->where('type', 2) // Type 2 for loans
                ->get();

            foreach ($loansData as $loan) {
                // Fetch title from HrEmployeeBenefitsList using benefitlist_id
                $loanList = HrEmployeeBenefitsList::find($loan->benefitlist_id);
                if ($loanList) {
                    $loansListNames[] = $loanList->title;
                    $loansListValues[] = (float) $loan->totalAmount;
                }
            }

            // Calculate sum of loans
            $sumLoans = array_reduce($loansData->pluck('totalAmount')->toArray(), function ($carry, $item) {
                return $carry + $item;
            }, 0);

            // Log the structured loans for debugging
            Log::info('loansListNames: ' . json_encode($loansListNames));
            Log::info('loansListValues: ' . json_encode($loansListValues));
            Log::info('sumLoans: ' . $sumLoans);

            // Fetch taxes data
            $taxesData = HrPayrollBenefit::where('payroll_id', $id)
                ->where('type', 4) // Type 4 for taxes
                ->get();

            foreach ($taxesData as $tax) {
                // Fetch title from HrEmployeeBenefitsList using benefitlist_id
                $taxList = HrEmployeeBenefitsList::find($tax->benefitlist_id);
                if ($taxList) {
                    $taxesListNames[] = $taxList->title;
                    $taxesListValues[] = (float) $tax->totalAmount;
                }
            }

            // Calculate sum of taxes
            $sumTaxes = array_reduce($taxesData->pluck('totalAmount')->toArray(), function ($carry, $item) {
                return $carry + $item;
            }, 0);

            // Log the structured taxes for debugging
            Log::info('taxesListNames: ' . json_encode($taxesListNames));
            Log::info('taxesListValues: ' . json_encode($taxesListValues));
            Log::info('sumTaxes: ' . $sumTaxes);

            $sumBenefits = array_reduce($benefitsData->pluck('totalAmount')->toArray(), function ($carry, $item) {
                return $carry + $item;
            }, 0);
    
            // Calculate sum of contributions
            $sumContributions = array_reduce($contributionsData->pluck('totalAmount')->toArray(), function ($carry, $item) {
                return $carry + $item;
            }, 0);

            (float) $totalDeductions = $sumContributions + $sumTaxes + $sumLoans;

            (float) $netPay = $totalPay - $totalDeductions;

            return response()->json([
                'allRecords' => $allRecordsData,
                'user' => $user,
                'earningsListNames' => $listNames,
                'earningsListValues' => array_values($totalEarnings),
                'benefitsListNames' => $benefitsListNames,
                'benefitsListValues' => array_values($benefitsListValues),
                'totalBenefits' => $sumBenefits,
                'totalContributions' => $sumContributions,
                'contributionsListNames' => $contributionsListNames,
                'contributionsListValues' => array_values($contributionsListValues),
                'loansListNames' => $loansListNames,
                'loansListValues' => $loansListValues,
                'totalLoans' => $sumLoans,
                'taxesListNames' => $taxesListNames,
                'taxesListValues' => $taxesListValues,
                'totalTaxes' => $sumTaxes,
                'totalPay' => $totalPay,
                'totalDeductions' => $totalDeductions,
                'netPay' => $netPay,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'An error occurred'
            ], 500);
        }
    }

    public function getPayrollRemainingLoan(Request $request, $id)
    {

        try {
            $payrollData = $request->validate([
                'payrollData' => 'required|array',
            ]);

            $allrecords = array($payrollData['payrollData']);

            foreach ($allrecords as $list) {
                $user_id = $list['user_id'];

                $payroll_remainingLoans = DB::table('hr_payroll_benefits')
                    ->select('amountTotal', 'totalAmount')
                    ->where('emp_id', '=', $user_id)
                    ->where('payroll_id', '=', $id)
                    ->where('type', 2)
                    ->get();

                $sumAmountTotal = 0;
                $sumAmount = 0;

                foreach ($payroll_remainingLoans as $loan) {
                    $sumAmountTotal += $loan->amountTotal;
                    $sumAmount += $loan->totalAmount;
                }
            }
            return response()->json([
                'status' => 200,
                'remainingLoan' => $payroll_remainingLoans ? $sumAmountTotal - $sumAmount : 0
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'An error occurred'
            ], 500);
        }
    }
    

    public function storeSignature(Request $request, $id)
    {
        Log::info('is run');
        try {
            // Validate the request
            $request->validate([
                'signature' => 'required|string',
            ]);
    
            // Decode the base64 string to get the image data
            $base64Image = $request->input('signature');
            $base64Image = substr($base64Image, strpos($base64Image, ',') + 1); 
            $imageData = base64_decode($base64Image);
    
            // Generate a unique filename for the image
            $filename = 'payroll_signature_' . $id . '.png';
    
            // Store the image file in storage/app/public directory
            Storage::disk('public')->put($filename, $imageData);
    
            // Update the 'signature' column in hr_payroll_allrecords table
            $payrollRecord = HrPayrollAllRecord::where('payroll_id', $id)->firstOrFail();
            $payrollRecord->signature = $filename; // Assuming 'signature' is the column name
            $payrollRecord->save();
    
            return response()->json([
                'message' => 'Signature uploaded and linked to payroll record successfully.',
                'filename' => $filename, // Optional: Return filename for client-side reference
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in storeSignature', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'An error occurred while storing the signature.',
            ], 500);
        }
    }
    
}