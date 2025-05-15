<?php

namespace App\Http\Controllers;

use App\Models\LoanProposalsModel;
use App\Models\LoanApplicationsModel;
use App\Models\LoanApplicationFilesModel;
use App\Models\UsersModel;

use App\Mail\ProposalNotificationMail; 

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail; 
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

use Carbon\Carbon;

class LoanApplicationsController extends Controller
{
    public function checkUser()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->user_type == 'Admin') {
                return true;
            }
        }
        return false;
    }

    public function getLoanApplications()
    {
        $user = Auth::user();
    
        $loans = LoanApplicationsModel::where('employee_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
    
        $loanApplications = [];
        foreach ($loans as $loan) {
            $employee = UsersModel::find($loan->employee_id);
            $approver = UsersModel::find($loan->approved_by);
            
            $proposal = LoanProposalsModel::where('loan_application_id', $loan->id)
                ->whereIn('status', ['Pending', 'Approved', 'Declined'])
                ->first();
    
            $loanApplications[] = [
                'id' => $loan->id,
                'employee_id' => $loan->employee_id,
                'employee_name' => $employee ? trim($employee->first_name . ' ' . ($employee->middle_name ? $employee->middle_name . ' ' : '') . $employee->last_name) : 'Unknown',
                'loan_amount' => $loan->loan_amount,
                'reason' => $loan->reason,
                'status' => $loan->status,
                'payment_term' => $loan->payment_term,
                'approved_by' => $loan->approved_by,
                'approver_name' => $approver ? trim($approver->first_name . ' ' . ($approver->middle_name ? $approver->middle_name . ' ' : '') . $approver->last_name) : null,
                'created_at' => $loan->created_at,
                'proposal_status' => $proposal ? $proposal->status : null,
            ];
        }
    
        return response()->json(['status' => 200, 'loans' => $loanApplications]);
    }

    public function getLoanDetails($id)
    {
        $user = Auth::user();
    
        $loan = $this->checkUser() 
            ? LoanApplicationsModel::where('id', $id)->first()
            : LoanApplicationsModel::where('id', $id)->where('employee_id', $user->id)->first();
    
        if (!$loan) {
            Log::warning("Loan not found or unauthorized for ID: $id, User ID: {$user->id}");
            return response()->json(['status' => 403, 'message' => 'Unauthorized access to loan application'], 403);
        }
    
        $employee = UsersModel::find($loan->employee_id);
        $approver = UsersModel::find($loan->approved_by);
    
        $files = LoanApplicationFilesModel::where('loan_application_id', $loan->id)
            ->select('id', 'path', 'type')
            ->get();
    
        $attachments = [];
        foreach ($files as $file) {
            $attachments[] = [
                'id' => $file->id,
                'filename' => basename($file->path),
                'type' => $file->type,
            ];
        }
    
        $proposal = LoanProposalsModel::where('loan_application_id', $loan->id)
            ->whereIn('status', ['Pending', 'Approved', 'Declined'])
            ->first();
    
        $loanAmount = $proposal && $proposal->status === 'Approved' ? $proposal->proposed_loan_amount : $loan->loan_amount;
        $paymentTerm = $proposal && $proposal->status === 'Approved' ? $proposal->proposed_payment_term : $loan->payment_term;
        $monthlyInterestRate = $proposal && $proposal->status === 'Approved' ? $proposal->monthly_interest_rate / 100 : 0;

        // Calculate paid and remaining amounts
        $r = $monthlyInterestRate;
        $pv = floatval($loanAmount);
        $n = intval($paymentTerm);
        $monthlyPayment = $r > 0 ? ($r * $pv) / (1 - pow(1 + $r, -$n)) : $pv / $n;
        $monthlyPayment = round($monthlyPayment, 2);

        $elapsedMonths = 0;
        $paidAmount = 0;
        $remainingAmount = $loanAmount;
        if (in_array($loan->status, ['Approved', 'Released', 'Paid'])) {
            $elapsedMonths = Carbon::now()->diffInMonths($loan->updated_at);
            $elapsedMonths = min($elapsedMonths, $paymentTerm);
            $paidAmount = $monthlyPayment * $elapsedMonths;
            $paidAmount = min($paidAmount, $loanAmount);
            $remainingAmount = $loanAmount - $paidAmount;
            $remainingAmount = max($remainingAmount, 0);
        }

        $proposalData = $proposal ? [
            'id' => $proposal->id,
            'proposed_loan_amount' => $proposal->proposed_loan_amount,
            'proposed_payment_term' => $proposal->proposed_payment_term,
            'monthly_interest_rate' => $proposal->monthly_interest_rate,
            'proposed_monthly_payment' => $proposal->proposed_monthly_payment,
            'status' => $proposal->status,
        ] : null;
    
        $loanDetails = [
            'id' => $loan->id,
            'employee_id' => $loan->employee_id,
            'employee_name' => $employee ? trim($employee->first_name . ' ' . ($employee->middle_name ? $employee->middle_name . ' ' : '') . $employee->last_name) : 'Unknown',
            'employment_type' => $employee->employment_type ?? '-',
            'role' => $employee->role->name ?? '-',
            'job_title' => $employee->jobTitle->name ?? '-',
            'branch' => $employee->branch->name ?? '-',
            'department' => $employee->department->name ?? 'Public Relations',
            'loan_amount' => $loan->loan_amount,
            'reason' => $loan->reason,
            'status' => $loan->status,
            'payment_term' => $loan->payment_term,
            'paid_amount' => $paidAmount,
            'remaining_amount' => $remainingAmount,
            'approved_by' => $loan->approved_by,
            'approver_name' => $approver ? trim($approver->first_name . ' ' . ($approver->middle_name ? $approver->middle_name . ' ' : '') . $approver->last_name) : null,
            'created_at' => $loan->created_at->format('Y-m-d H:i:s'),
            'attachments' => $attachments ?: null,
            'proposal' => $proposalData,
            'proposal_status' => $proposal ? $proposal->status : null,
        ];
    
        return response()->json(['status' => 200, 'loan' => $loanDetails]);
    }

    public function getCurrentLoans($employeeId)
    {
        $user = Auth::user();

        Log::info("Attempting to fetch current loans for Employee ID: $employeeId, User ID: {$user->id}, User Type: {$user->user_type}");

        // Validate employeeId
        if (!is_numeric($employeeId) || !UsersModel::find($employeeId)) {
            Log::warning("Invalid or non-existent Employee ID: $employeeId");
            return response()->json(['status' => 404, 'message' => 'Employee not found'], 404);
        }

        // Restrict access
        if (!$this->checkUser() && $user->id != $employeeId) {
            Log::warning("Unauthorized attempt to fetch current loans for Employee ID: $employeeId by User ID: {$user->id}");
            return response()->json(['status' => 403, 'message' => 'Unauthorized access'], 403);
        }

        // Debug: Log all loans for employee_id
        $allLoans = LoanApplicationsModel::where('employee_id', $employeeId)
            ->withTrashed()
            ->get(['id', 'employee_id', 'status', 'loan_amount', 'payment_term', 'deleted_at']);
        Log::info("All loans for Employee ID: $employeeId", ['loans' => $allLoans->toArray()]);

        // Fetch Approved loans only
        $loans = LoanApplicationsModel::where('employee_id', $employeeId)
            ->where('status', 'Approved')
            ->orderBy('created_at', 'desc')
            ->get();

        $existingLoans = [];

        foreach ($loans as $loan) {
            $proposal = LoanProposalsModel::where('loan_application_id', $loan->id)
                ->where('status', 'Approved')
                ->first();

            $loanAmount = $proposal ? $proposal->proposed_loan_amount : $loan->loan_amount;
            $paymentTerm = $proposal ? $proposal->proposed_payment_term : $loan->payment_term;

            $existingLoans[] = [
                'id' => $loan->id,
                'loan_amount' => $loanAmount,
                'remaining_months' => $paymentTerm,
                'paid_amount' => 0,
                'remaining_amount' => $loanAmount,
                'status' => $loan->status,
            ];
        }

        Log::info("Fetched " . count($existingLoans) . " current loans for Employee ID: $employeeId", ['loans' => $existingLoans]);

        return response()->json(['status' => 200, 'loans' => $existingLoans]);
    }

    public function saveLoanApplication(Request $request)
    {
        $user = Auth::user();

        try {
            $request->validate([
                'loan_amount' => 'required|numeric|min:1',
                'reason' => 'required|string|max:255',
                'payment_term' => 'required|integer|min:1',
            ]);

            DB::beginTransaction();

            $loan = LoanApplicationsModel::create([
                'employee_id' => $user->id,
                'loan_amount' => $request->input('loan_amount'),
                'reason' => $request->input('reason'),
                'status' => 'Pending',
                'payment_term' => $request->input('payment_term'),
                'approved_by' => null,
            ]);

            $dateTime = now()->format('YmdHis');

            if ($request->hasFile('attachment')) {
                foreach ($request->file('attachment') as $file) {
                    if (!$file->isValid()) {
                        throw new \Exception("Invalid attachment file uploaded");
                    }
                    $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                    $filePath = $file->storeAs('loans/employees/attachments', $fileName, 'public');

                    LoanApplicationFilesModel::create([
                        'loan_application_id' => $loan->id,
                        'type' => 'Document',
                        'path' => $filePath,
                    ]);
                }
            }

            if ($request->hasFile('image')) {
                foreach ($request->file('image') as $file) {
                    if (!$file->isValid()) {
                        throw new \Exception("Invalid image file uploaded");
                    }
                    $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                    $filePath = $file->storeAs('loans/employees/images', $fileName, 'public');

                    LoanApplicationFilesModel::create([
                        'loan_application_id' => $loan->id,
                        'type' => 'Image',
                        'path' => $filePath,
                    ]);
                }
            }

            DB::commit();

            return response()->json(['status' => 200, 'message' => 'Loan application submitted successfully']);
        } catch (ValidationException $e) {
            Log::warning("Validation error saving loan application: " . json_encode($e->errors()));
            return response()->json(['status' => 422, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error saving loan application: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Error saving loan application: ' . $e->getMessage()], 500);
        }
    }

    public function cancelLoanApplication($id)
    {
        $user = Auth::user();

        $loan = LoanApplicationsModel::where('id', $id)
            ->where('employee_id', $user->id)
            ->first();

        if (!$loan) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized access to loan application'], 403);
        }

        if ($loan->status !== 'Pending') {
            return response()->json(['status' => 400, 'message' => 'Only Pending loan applications can be cancelled'], 400);
        }

        try {
            $loan->status = 'Cancelled';
            $loan->save();

            return response()->json(['status' => 200, 'message' => 'Loan application cancelled successfully']);
        } catch (\Exception $e) {
            Log::error("Error cancelling loan application: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Error cancelling loan application: ' . $e->getMessage()], 500);
        }
    }

    public function getLoanApplicationFiles($id)
    {
        $user = Auth::user();

        $loan = LoanApplicationsModel::where('id', $id)
            ->where('employee_id', $user->id)
            ->first();

        if (!$loan) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized access to loan application'], 403);
        }

        $files = LoanApplicationFilesModel::where('loan_application_id', $id)
            ->select('id', 'path', 'type')
            ->get();

        $filenames = [];
        foreach ($files as $file) {
            $filenames[] = [
                'id' => $file->id,
                'filename' => basename($file->path),
                'type' => $file->type,
            ];
        }

        return response()->json(['status' => 200, 'filenames' => $filenames ?: null]);
    }

    public function downloadFile($id)
    {
        $user = Auth::user();

        $file = LoanApplicationFilesModel::find($id);

        if (!$file) {
            return response()->json(['status' => 404, 'message' => 'File not found'], 404);
        }

        $loan = $this->checkUser()
            ? LoanApplicationsModel::where('id', $file->loan_application_id)->first()
            : LoanApplicationsModel::where('id', $file->loan_application_id)
                ->where('employee_id', $user->id)
                ->first();

        if (!$loan) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized access to file'], 403);
        }

        $filePath = storage_path('app/public/' . $file->path);

        if (!file_exists($filePath)) {
            return response()->json(['status' => 404, 'message' => 'File not found on server'], 404);
        }

        $fileName = basename($file->path);

        return response()->download($filePath, $fileName, [
            'Content-Type' => mime_content_type($filePath),
        ]);
    }

    public function editLoanApplication(Request $request)
    {
        $user = Auth::user();

        try {
            $request->validate([
                'id' => 'required|integer|exists:loan_applications,id',
                'loan_amount' => 'required|numeric|min:1',
                'reason' => 'required|string|max:255',
                'payment_term' => 'required|integer|min:1',
                'deleteAttachments' => 'sometimes|array',
                'deleteAttachments.*' => 'integer|exists:loan_application_files,id',
                'deleteImages' => 'sometimes|array',
                'deleteImages.*' => 'integer|exists:loan_application_files,id',
                'attachment.*' => 'sometimes|file|mimes:pdf,doc,docx|max:10240', // 10MB max
                'image.*' => 'sometimes|file|mimes:jpg,jpeg,png|max:5120', // 5MB max
            ]);

            $loan = LoanApplicationsModel::where('id', $request->input('id'))
                ->where('employee_id', $user->id)
                ->first();

            if (!$loan) {
                Log::warning("Loan not found or unauthorized access for ID: " . $request->input('id') . ", User ID: {$user->id}");
                return response()->json(['status' => 403, 'message' => 'Unauthorized access to loan application'], 403);
            }

            if ($loan->status !== 'Pending') {
                Log::warning("Loan status is not Pending for ID: " . $loan->id);
                return response()->json(['status' => 400, 'message' => 'Only Pending loan applications can be edited'], 400);
            }

            DB::beginTransaction();

            $loan->loan_amount = $request->input('loan_amount');
            $loan->reason = $request->input('reason');
            $loan->payment_term = $request->input('payment_term');
            $loan->save();

            $dateTime = now()->format('YmdHis');

            if ($request->hasFile('attachment')) {
                foreach ($request->file('attachment') as $file) {
                    $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                    $filePath = $file->storeAs('loans/employees/attachments', $fileName, 'public');
                    LoanApplicationFilesModel::create([
                        'loan_application_id' => $loan->id,
                        'type' => 'Document',
                        'path' => $filePath,
                    ]);
                }
            }

            if ($request->hasFile('image')) {
                foreach ($request->file('image') as $file) {
                    $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                    $filePath = $file->storeAs('loans/employees/images', $fileName, 'public');
                    LoanApplicationFilesModel::create([
                        'loan_application_id' => $loan->id,
                        'type' => 'Image',
                        'path' => $filePath,
                    ]);
                }
            }

            // Handle deleteAttachments, filtering out null or non-integer values
            $deleteAttachments = array_filter(
                $request->input('deleteAttachments', []),
                fn($value) => is_numeric($value) && (int)$value > 0
            );
            if (!empty($deleteAttachments)) {
                foreach ($deleteAttachments as $fileId) {
                    $file = LoanApplicationFilesModel::find($fileId);
                    if ($file && $file->loan_application_id === $loan->id) {
                        $filePath = storage_path('app/public/' . $file->path);
                        if (file_exists($filePath)) {
                            unlink($filePath);
                        }
                        $file->delete();
                    }
                }
            }

            // Handle deleteImages, filtering out null or non-integer values
            $deleteImages = array_filter(
                $request->input('deleteImages', []),
                fn($value) => is_numeric($value) && (int)$value > 0
            );
            if (!empty($deleteImages)) {
                foreach ($deleteImages as $fileId) {
                    $file = LoanApplicationFilesModel::find($fileId);
                    if ($file && $file->loan_application_id === $loan->id) {
                        $filePath = storage_path('app/public/' . $file->path);
                        if (file_exists($filePath)) {
                            unlink($filePath);
                        }
                        $file->delete();
                    }
                }
            }

            DB::commit();
            Log::info("Loan application updated successfully for ID: " . $loan->id . " by User ID: {$user->id}");
            return response()->json(['status' => 200, 'message' => 'Loan application updated successfully']);
        } catch (ValidationException $e) {
            Log::warning("Validation error updating loan application: " . json_encode($e->errors()));
            return response()->json(['status' => 422, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating loan application: " . $e->getMessage() . " | Stack: " . $e->getTraceAsString());
            return response()->json(['status' => 500, 'message' => 'Error updating loan application: ' . $e->getMessage()], 500);
        }
    }

    public function getAllLoanApplications()
    {
        // Log::info("LoanApplicationsController::getAllLoanApplications");

        $user = Auth::user();

        if ($this->checkUser()) {
            $loans = LoanApplicationsModel::with(['user', 'department', 'branch', 'jobTitle'])
                ->orderBy('created_at', 'desc')
                ->get();

            $loanApplications = [];

            foreach ($loans as $loan) {
                $employee = $loan->user;
                $branch = $loan->branch;
                $department = $loan->department;
                $job_title = $loan->jobTitle;

                $loanApplications[] = [
                    'loan_id' => $loan->id,
                    'loan_amount' => $loan->loan_amount,
                    'payment_term' => $loan->payment_term,
                    'status' => $loan->status,
                    'date_created' => $loan->created_at->format('Y-m-d H:i:s'),
                    'emp_id' => $loan->employee_id,
                    'emp_first_name' => $employee ? $employee->first_name : 'Unknown',
                    'emp_middle_name' => $employee ? $employee->middle_name : null,
                    'emp_last_name' => $employee ? $employee->last_name : 'Unknown',
                    'emp_suffix' => $employee ? $employee->suffix : null,
                    'emp_branch' => $branch ? $branch->name : '',
                    'emp_department' => $department ? $department->name : '',
                    'emp_job_title' => $job_title ? $job_title->name : ''
                ];
            }

            return response()->json(['status' => 200, 'loans' => $loanApplications]);
        } else {
            return response()->json(['status' => 403, 'message' => 'Unauthorized access'], 403);
        }
    }

    public function updateLoanStatus(Request $request, $id)
    {
        // Log::info("LoanApplicationsController::updateLoanStatus for loan ID: " . $id);

        $user = Auth::user();

        if (!$this->checkUser()) {
            Log::warning("Unauthorized attempt to update loan status by User ID: {$user->id}");
            return response()->json(['status' => 403, 'message' => 'Unauthorized access: Admin privileges required'], 403);
        }

        $loan = LoanApplicationsModel::find($id);

        if (!$loan) {
            Log::warning("Loan not found for ID: $id");
            return response()->json(['status' => 404, 'message' => 'Loan application not found'], 404);
        }

        try {
            $request->validate([
                'status' => 'required|in:Pending,Approved,Declined,Released,Paid,Cancelled'
            ]);
        } catch (ValidationException $e) {
            Log::warning("Validation error updating loan status for ID: $id: " . json_encode($e->errors()));
            return response()->json(['status' => 422, 'message' => 'Invalid status provided', 'errors' => $e->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $loan->status = $request->input('status');
            $loan->approved_by = $user->id;
            $loan->save();

            DB::commit();
            Log::info("Loan status updated successfully for ID: $id to {$loan->status} by User ID: {$user->id}");
            return response()->json(['status' => 200, 'message' => 'Loan status updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating loan status for ID: $id: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Error updating loan status: ' . $e->getMessage()], 500);
        }
    }

    private function calculateAmortizationSchedule($loanAmount, $paymentTerm, $monthlyInterestRate)
    {
        $schedule = [];
        $r = $monthlyInterestRate / 100;
        $pv = floatval($loanAmount);
        $n = intval($paymentTerm);
        $monthlyPayment = ($r * $pv) / (1 - pow(1 + $r, -$n));

        $balance = $pv;
        for ($month = 1; $month <= $n; $month++) {
            $interest = $balance * $r;
            $principal = $monthlyPayment - $interest;
            $balance -= $principal;
            $schedule[] = [
                'month' => $month,
                'payment' => $monthlyPayment,
                'principal' => $principal,
                'interest' => $interest,
                'balance' => max($balance, 0),
            ];
        }
        return $schedule;
    }
    
    public function createProposal(Request $request, $id)
    {
        $user = Auth::user();

        if (!$this->checkUser()) {
            Log::warning("Unauthorized attempt to create proposal by User ID: {$user->id}");
            return response()->json(['status' => 403, 'message' => 'Unauthorized access: Admin privileges required'], 403);
        }

        $loan = LoanApplicationsModel::find($id);

        if (!$loan) {
            Log::warning("Loan not found for ID: $id");
            return response()->json(['status' => 404, 'message' => 'Loan application not found'], 404);
        }

        if ($loan->status !== 'Pending') {
            Log::warning("Attempt to create proposal for non-Pending loan ID: $id");
            return response()->json(['status' => 400, 'message' => 'Proposals can only be created for Pending loans'], 400);
        }

        try {
            $request->validate([
                'proposed_loan_amount' => 'required|numeric|min:1',
                'proposed_payment_term' => 'required|integer|min:1',
                'monthly_interest_rate' => 'required|numeric|min:0'
            ]);
        } catch (ValidationException $e) {
            Log::warning("Validation error creating proposal for loan ID: $id: " . json_encode($e->errors()));
            return response()->json(['status' => 422, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        }

        $proposedLoanAmount = $request->input('proposed_loan_amount');
        $proposedPaymentTerm = $request->input('proposed_payment_term');
        $monthlyInterestRate = $request->input('monthly_interest_rate') / 100;

        $r = $monthlyInterestRate;
        $pv = $proposedLoanAmount;
        $n = $proposedPaymentTerm;
        $monthlyPayment = ($r * $pv) / (1 - pow(1 + $r, -$n));
        $monthlyPayment = round($monthlyPayment, 2);

        $amortizationSchedule = $this->calculateAmortizationSchedule(
            $proposedLoanAmount,
            $proposedPaymentTerm,
            $request->input('monthly_interest_rate')
        );

        try {
            $proposal = LoanProposalsModel::create([
                'loan_application_id' => $loan->id,
                'proposed_loan_amount' => $proposedLoanAmount,
                'proposed_payment_term' => $proposedPaymentTerm,
                'monthly_interest_rate' => $request->input('monthly_interest_rate'),
                'proposed_monthly_payment' => $monthlyPayment,
                'status' => 'Pending',
                'created_by' => $user->id
            ]);

            $employee = UsersModel::find($loan->employee_id);
            if ($employee && $employee->email) {
                Mail::to($employee->email)->send(new ProposalNotificationMail($loan, $proposal, $employee, $amortizationSchedule));
                Log::info("Email sent to employee ID: " . $employee->id . " for loan proposal on loan ID: " . $loan->id);
            } else {
                Log::warning("Employee email not found for employee ID: " . $loan->employee_id);
            }

            return response()->json([
                'status' => 200,
                'proposal' => [
                    'id' => $proposal->id,
                    'proposed_loan_amount' => $proposal->proposed_loan_amount,
                    'proposed_payment_term' => $proposal->proposed_payment_term,
                    'monthly_interest_rate' => $proposal->monthly_interest_rate,
                    'proposed_monthly_payment' => $proposal->proposed_monthly_payment
                ],
                'message' => 'Proposal created successfully'
            ]);
        } catch (\Exception $e) {
            Log::error("Error creating proposal for loan ID: $id: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Error creating proposal: ' . $e->getMessage()], 500);
        }
    }

    public function getLoanProposal($id)
    {
        $user = Auth::user();

        $loan = LoanApplicationsModel::where('id', $id)
            ->where('employee_id', $user->id)
            ->first();

        if (!$loan) {
            Log::warning("Unauthorized access to loan proposal for ID: $id by User ID: {$user->id}");
            return response()->json(['status' => 403, 'message' => 'Unauthorized access to loan application'], 403);
        }

        $proposal = LoanProposalsModel::where('loan_application_id', $id)
            ->whereIn('status', ['Pending', 'Approved', 'Declined'])
            ->first();

        if ($proposal) {
            return response()->json([
                'status' => 200,
                'proposal' => [
                    'id' => $proposal->id,
                    'proposed_loan_amount' => $proposal->proposed_loan_amount,
                    'proposed_payment_term' => $proposal->proposed_payment_term,
                    'monthly_interest_rate' => $proposal->monthly_interest_rate,
                    'proposed_monthly_payment' => $proposal->proposed_monthly_payment,
                    'status' => $proposal->status
                ]
            ]);
        }

        return response()->json(['status' => 200, 'proposal' => null, 'message' => 'No proposal found']);
    }

    public function respondToProposal(Request $request, $loanId)
    {
        $user = Auth::user();
        $data = $request->all();

        Log::info("Responding to proposal for Loan ID: $loanId, User ID: {$user->id}, User Type: {$user->user_type}", ['data' => $data]);

        // Validate request
        $validator = Validator::make($data, [
            'action' => 'required|in:approve,decline',
            'proposed_loan_amount' => 'required|numeric|min:0',
            'proposed_payment_term' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            Log::warning("Validation failed for respondToProposal", ['errors' => $validator->errors()]);
            return response()->json(['status' => 422, 'message' => $validator->errors()], 422);
        }

        $loan = LoanApplicationsModel::find($loanId);
        if (!$loan) {
            Log::warning("Loan not found: $loanId");
            return response()->json(['status' => 404, 'message' => 'Loan not found'], 404);
        }

        if ($loan->employee_id !== $user->id) {
            Log::warning("Unauthorized attempt to respond to proposal for Loan ID: $loanId by User ID: {$user->id}");
            return response()->json(['status' => 403, 'message' => 'Unauthorized access to loan proposal'], 403);
        }

        $proposal = LoanProposalsModel::where('loan_application_id', $loanId)->first();
        if (!$proposal) {
            Log::warning("Proposal not found for Loan ID: $loanId");
            return response()->json(['status' => 404, 'message' => 'Proposal not found'], 404);
        }

        // Update statuses
        $action = $data['action'];
        $newStatus = $action === 'approve' ? 'Approved' : 'Declined';
        $proposal->status = $newStatus;
        $proposal->proposed_loan_amount = $data['proposed_loan_amount'];
        $proposal->proposed_payment_term = $data['proposed_payment_term'];
        $proposal->save();

        $loan->status = $newStatus;
        if ($action === 'approve') {
            $loan->approved_by = $proposal->created_by; // Use the ID of the admin who created the proposal
            $loan->loan_amount = $data['proposed_loan_amount'];
            $loan->payment_term = $data['proposed_payment_term'];
            Log::info("Loan approved by Admin ID: {$proposal->created_by} for Loan ID: $loanId");
        }
        $loan->save();

        Log::info("Proposal and loan updated", [
            'loan_id' => $loanId,
            'status' => $newStatus,
            'approved_by' => $loan->approved_by,
        ]);

        return response()->json([
            'status' => 200,
            'message' => "Proposal {$action}d successfully",
            'proposal' => $proposal,
        ]);
    }
}