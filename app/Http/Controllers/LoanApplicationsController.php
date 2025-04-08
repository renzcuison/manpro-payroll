<?php

namespace App\Http\Controllers;

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
    
        // Fetch loans sorted by created_at in descending order
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

        // Fetch the loan application by ID, ensuring it belongs to the authenticated user
        $loan = LoanApplicationsModel::where('id', $id)
            ->where('employee_id', $user->id)
            ->first();

        if (!$loan) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized access to loan application'], 403);
        }

        // Fetch the employee and approver details
        $employee = UsersModel::find($loan->employee_id);
        $approver = UsersModel::find($loan->approved_by);

        // Fetch the attachments
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

        // Since we're not tracking payments yet, set paid_amount to 0
        $paidAmount = 0;
        $remainingAmount = $loan->loan_amount - $paidAmount;

        // Prepare the loan details
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
        ];

        return response()->json(['status' => 200, 'loan' => $loanDetails]);
    }

    public function saveLoanApplication(Request $request)
    {
        $user = Auth::user();

        try {
            DB::beginTransaction();

            // Create a new loan application for the logged-in employee
            $loan = LoanApplicationsModel::create([
                'employee_id' => $user->id,
                'loan_amount' => $request->input('loan_amount'),
                'reason' => $request->input('reason'),
                'status' => 'Pending',
                'payment_term' => $request->input('payment_term'),
                'approved_by' => null,
            ]);

            $dateTime = now()->format('YmdHis');

            // Handle file uploads - Documents
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

            // Handle file uploads - Images
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

        // Fetch the loan application by ID, ensuring it belongs to the authenticated user
        $loan = LoanApplicationsModel::where('id', $id)
            ->where('employee_id', $user->id)
            ->first();

        if (!$loan) {
            return response()->json(['status' => 403, 'message' => 'Unauthorized access to loan application'], 403);
        }

        // Check if the loan is in a cancellable state (e.g., Pending)
        if ($loan->status !== 'Pending') {
            return response()->json(['status' => 400, 'message' => 'Only Pending loan applications can be cancelled'], 400);
        }

        try {
            // Update the loan status to Cancelled
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

        // Ensure the employee can only access their own loan application files
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

        // Ensure the employee can only download files from their own loan applications
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

}