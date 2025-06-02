<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'title', 'description', 'start_time', 'end_time',
    ];
}