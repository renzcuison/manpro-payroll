<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MilestoneComment extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function milestone(): BelongsTo
    {
        return $this->belongsTo(Milestone::class, 'milestone_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }
}