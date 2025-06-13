<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;  

class Milestone extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public function user(): BelongsTo
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(UsersModel::class, 'created_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(MilestoneComment::class, 'milestone_id');
    }
}