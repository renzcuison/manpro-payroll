<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Company extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(UsersModel::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }
}