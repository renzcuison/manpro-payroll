<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Loan Proposal - ManPro Management</title>
</head>
<body>
    <div style="margin: 10px 5% 10px; background-color: #008018; border-radius: 10px; padding: 5px 5px 5px;">
        <!-- Header with Logo -->
        <div style="justify-content: center; align-items: center; text-align: center; margin: 10px">
            <img src="https://manpromanagement.com/images/ManPro.png" style="width: 15%; border: 3px solid white; border-radius: 10px; background-color: white;">
        </div>
        <!-- Main Content Area -->
        <div style="background-color: white">
            <!-- Banner Image -->
            <div class="parent" style="overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 5px">
                <img src="https://manpromanagement.com/images/emailbanner.jpg" style="width: 100%;">
            </div>
            <!-- Email Body -->
            <table width="100%" border="0" cellspacing="0" cellpadding="20" style="color: #5a5f61; font-family:verdana;">
                <tr>
                    <td>
                        <div>Dear {{ $employee->first_name }} {{ $employee->last_name }},</div>
                        <div><br></div>
                        <div>We are pleased to inform you that a proposal has been created for your loan application. Please review the details below:</div>
                        <div><br></div>
                        <div>
                            <strong>Loan Application Details:</strong><br>
                            Loan Amount: ₱{{ number_format($loan->loan_amount, 2, '.', ',') }}<br>
                            Reason: {{ $loan->reason }}<br>
                            Payment Term: {{ $loan->payment_term }} months<br>
                            <br>
                            <strong>Proposal Details:</strong><br>
                            Proposed Loan Amount: ₱{{ number_format($proposal->proposed_loan_amount, 2, '.', ',') }}<br>
                            Proposed Payment Term: {{ $proposal->proposed_payment_term }} months<br>
                            Monthly Interest Rate: {{ $proposal->monthly_interest_rate }}%<br>
                            Proposed Monthly Payment: ₱{{ number_format($proposal->proposed_monthly_payment, 2, '.', ',') }}<br>
                            <br>
                            <!-- Monthly Payment Schedule Table -->
                            <strong>Monthly Payment Schedule:</strong><br>
                            <table border="1" cellspacing="0" cellpadding="5" style="width: 100%; border-collapse: collapse; color: #5a5f61; font-family:verdana; margin-top: 10px;">
                                <thead>
                                    <tr style="background-color: #f0f0f0;">
                                        <th style="text-align: center;">Month</th>
                                        <th style="text-align: center;">Payment</th>
                                        <th style="text-align: center;">Remaining Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($amortizationSchedule as $row)
                                        <tr>
                                            <td style="text-align: center;">{{ $row['month'] }}</td>
                                            <td style="text-align: center;">₱{{ number_format($row['payment'], 2, '.', ',') }}</td>
                                            <td style="text-align: center;">₱{{ number_format($row['balance'], 2, '.', ',') }}</td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="5" style="text-align: center;">No schedule available.</td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                            <br>
                            Please log in to the ManPro Management portal to review the proposal and respond by approving or declining it. If you have any questions, feel free to contact our support team.
                        </div>
                    </td>
                </tr>
            </table>
            <!-- Footer -->
            <div style="text-align: center; padding: 20px 0px; color: #fff; background-color: #008018; font-family:verdana">
                Your Gateway to Innovative Management Solutions for Businesses in the Philippines<br>
                support@manpro.ph<br>
                <a href="https://manpro.ph/" style="color: white;">https://manpro.ph/</a>
            </div>
        </div>
    </div>
</body>
</html>