<?php

namespace App\Http\Controllers;

use App\Models\LoanProposalsModel;
use App\Models\LoanApplicationsModel;
use App\Models\LoanApplicationFilesModel;
use App\Models\UsersModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
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
            $paidAmount = 0;
            $remainingAmount = $loan->loan_amount - $paidAmount;
    
            $loanApplications[] = [
                'id' => $loan->id,
                'employee_id' => $loan->employee_id,
                'employee_name' => $employee ? $employee->first_name . ' ' . $employee->last_name : 'Unknown',
                'loan_amount' => $loan->loan_amount,
                'reason' => $loan->reason,
                'status' => $loan->status,
                'payment_term' => $loan->payment_term,
                'paid_amount' => $paidAmount,
                'remaining_amount' => $remainingAmount,
                'approved_by' => $loan->approved_by,
                'approver_name' => $approver ? $approver->first_name . ' ' . $approver->last_name : null,
                'created_at' => $loan->created_at,
            ];
        }
    
        return response()->json(['status' => 200, 'loans' => $loanApplications]);
    }

    public function getLoanDetails($id)
    {
        $user = Auth::user();
    
        $loan = null;
        if ($this->checkUser()) {
            $loan = LoanApplicationsModel::where('id', $id)->first();
        } else {
            $loan = LoanApplicationsModel::where('id', $id)
                ->where('employee_id', $user->id)
                ->first();
        }
    
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
    
        $paidAmount = 0;
        $remainingAmount = $loan->loan_amount - $paidAmount;
    
        $loanDetails = [
            'id' => $loan->id,
            'employee_name' => $employee ? $employee->first_name . ' ' . $employee->last_name : 'Unknown',
            'loan_amount' => $loan->loan_amount,
            'reason' => $loan->reason,
            'status' => $loan->status,
            'payment_term' => $loan->payment_term,
            'paid_amount' => $paidAmount,
            'remaining_amount' => $remainingAmount,
            'approved_by' => $loan->approved_by,
            'approver_name' => $approver ? $approver->first_name . ' ' . $approver->last_name : null,
            'created_at' => $loan->created_at->format('Y-m-d H:i:s'),
            'attachments' => $attachments ?: null,
            'proposal' => $loan->proposal ? json_decode($loan->proposal, true) : null,
            'proposal_status' => $loan->proposal_status,
        ];
    
        return response()->json(['status' => 200, 'loan' => $loanDetails]);
    }
    
    public function saveLoanApplication(Request $request)
    {
        $user = Auth::user();

        try {
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

            DB::commit();

            return response()->json(['status' => 200, 'message' => 'Loan application submitted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error saving loan application: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Error saving loan application'], 500);
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
            return response()->json(['status' => 500, 'message' => 'Error cancelling loan application'], 500);
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

        $loan = LoanApplicationsModel::where('id', $file->loan_application_id)
            ->where('employee_id', $user->id)
            ->first();

        if (!$loan) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized access to file'], 403);
        }

        $filePath = storage_path('app/public/' . $file->path);

        if (!file_exists($filePath)) {
            return response()->json(['status' => 404, 'message' => 'File not found'], 404);
        }

        $fileName = basename($file->path);

        return response()->download($filePath, $fileName);
    }

    public function editLoanApplication(Request $request)
    {
        $user = Auth::user();

        Log::info("Starting editLoanApplication for user: " . $user->id . ", loan ID: " . $request->input('id'));

        $loan = LoanApplicationsModel::where('id', $request->input('id'))
            ->where('employee_id', $user->id)
            ->first();

        if (!$loan) {
            Log::warning("Loan not found or unauthorized access for ID: " . $request->input('id'));
            return response()->json(['status' => 403, 'message' => 'Unauthorized access to loan application'], 403);
        }

        if ($loan->status !== 'Pending') {
            Log::warning("Loan status is not Pending for ID: " . $loan->id);
            return response()->json(['status' => 400, 'message' => 'Only Pending loan applications can be edited'], 400);
        }

        try {
            DB::beginTransaction();

            Log::info("Updating loan details: " . json_encode($request->all()));
            $loan->loan_amount = $request->input('loan_amount');
            $loan->reason = $request->input('reason');
            $loan->payment_term = $request->input('payment_term');
            $loan->save();

            $dateTime = now()->format('YmdHis');

            if ($request->hasFile('attachment')) {
                Log::info("Processing new attachments: " . count($request->file('attachment')));
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
                Log::info("Processing new images: " . count($request->file('image')));
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

            if ($request->input('deleteAttachments') && !empty($request->input('deleteAttachments')[0])) {
                Log::info("Deleting attachments: " . json_encode($request->input('deleteAttachments')));
                foreach ($request->input('deleteAttachments') as $fileId) {
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

            if ($request->input('deleteImages') && !empty($request->input('deleteImages')[0])) {
                Log::info("Deleting images: " . json_encode($request->input('deleteImages')));
                foreach ($request->input('deleteImages') as $fileId) {
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
            Log::info("Loan application updated successfully for ID: " . $loan->id);
            return response()->json(['status' => 200, 'message' => 'Loan application updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating loan application: " . $e->getMessage() . " | Stack: " . $e->getTraceAsString());
            return response()->json(['status' => 500, 'message' => 'Error updating loan application: ' . $e->getMessage()], 500);
        }
    }

    public function getAllLoanApplications()
    {
        Log::info("LoanApplicationsController::getAllLoanApplications");

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
        Log::info("LoanApplicationsController::updateLoanStatus for loan ID: " . $id);

        $user = Auth::user();

        if (!$this->checkUser()) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized access'], 403);
        }

        $loan = LoanApplicationsModel::find($id);

        if (!$loan) {
            return response()->json(['status' => 404, 'message' => 'Loan application not found'], 404);
        }

        $request->validate([
            'status' => 'required|in:Pending,Approved,Declined,Released,Paid,Cancelled'
        ]);

        try {
            $loan->status = $request->input('status');
            $loan->approved_by = $user->id;
            $loan->save();

            return response()->json(['status' => 200, 'message' => 'Loan status updated successfully']);
        } catch (\Exception $e) {
            Log::error("Error updating loan status: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Error updating loan status'], 500);
        }
    }


        public function createProposal(Request $request, $id)
    {
        Log::info("LoanApplicationsController::createProposal for loan ID: " . $id);

        $user = Auth::user();

        if (!$this->checkUser()) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized access'], 403);
        }

        $loan = LoanApplicationsModel::find($id);

        if (!$loan) {
            return response()->json(['status' => 404, 'message' => 'Loan application not found'], 404);
        }

        $request->validate([
            'proposed_loan_amount' => 'required|numeric|min:1',
            'proposed_payment_term' => 'required|integer|min:1',
            'monthly_interest_rate' => 'required|numeric|min:0'
        ]);

        $proposedLoanAmount = $request->input('proposed_loan_amount');
        $proposedPaymentTerm = $request->input('proposed_payment_term');
        $monthlyInterestRate = $request->input('monthly_interest_rate') / 100;

        $r = $monthlyInterestRate;
        $pv = $proposedLoanAmount;
        $n = $proposedPaymentTerm;
        $monthlyPayment = ($r * $pv) / (1 - pow(1 + $r, -$n));
        $monthlyPayment = round($monthlyPayment, 2);

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
            Log::error("Error creating proposal: " . $e->getMessage());
            return response()->json(['status' => 500, 'message' => 'Error creating proposal'], 500);
        }
    }

}