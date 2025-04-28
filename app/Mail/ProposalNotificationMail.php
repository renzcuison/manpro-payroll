<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ProposalNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $loan;
    public $proposal;
    public $employee;
    public $amortizationSchedule;

    public function __construct($loan, $proposal, $employee, $amortizationSchedule)
    {
        $this->loan = $loan;
        $this->proposal = $proposal;
        $this->employee = $employee;
        $this->amortizationSchedule = $amortizationSchedule;
    }

    public function build()
    {
        return $this->view('mail.proposal_notification')
                    ->subject('New Loan Proposal - ManPro Management')
                    ->with([
                        'loan' => $this->loan,
                        'proposal' => $this->proposal,
                        'employee' => $this->employee,
                        'amortizationSchedule' => $this->amortizationSchedule,
                    ]);
    }
}