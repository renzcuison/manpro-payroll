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

    public function assignments()
    {
        return $this->hasMany(BranchPositionAssignment::class, 'branch_position_id');
    }

    public function branchPosition(): BelongsTo
    {
        return $this->belongsTo(BranchPositionsModel::class, 'branch_position_id');
    }

    public function branch()
    {
        return $this->belongsTo(BranchesModel::class);
    }
    public function client()
    {
        return $this->belongsTo(ClientsModel::class, 'client_id');
    }

}