<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BranchPosition extends Model
{
    protected $fillable = [
        'client_id',
        'name',
        'can_review_request',
        'can_approve_request',
        'can_note_request',
        'can_accept_request',
    ];
}