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

        // Fetch only the logged-in employee's loan applications
        $loans = LoanApplicationsModel::where('employee_id', $user->id)
            ->get();

        $loanApplications = [];

        foreach ($loans as $loan) {
            $employee = UsersModel::find($loan->employee_id);
            $approver = UsersModel::find($loan->approved_by);

            $loanApplications[] = [
                'id' => $loan->id,
                'employee_id' => $loan->employee_id,
                'employee_name' => $employee ? $employee->first_name . ' ' . $employee->last_name : 'Unknown',
                'loan_amount' => $loan->loan_amount,
                'reason' => $loan->reason,
                'status' => $loan->status,
                'payment_term' => $loan->payment_term,
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

        // Prepare the loan details
        $loanDetails = [
            'id' => $loan->id,
            'employee_name' => $employee ? $employee->first_name . ' ' . $employee->last_name : 'Unknown',
            'loan_amount' => $loan->loan_amount,
            'reason' => $loan->reason,
            'status' => $loan->status,
            'payment_term' => $loan->payment_term,
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
}