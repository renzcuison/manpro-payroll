<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PemeResponse extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'peme_response';

    protected $primaryKey = 'id';
    protected $fillable = [
        'user_id',
        'peme_id',
        'expiry_date',
        'next_schedule',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Belongs to a PEME
    public function peme()
    {
        return $this->belongsTo(Peme::class);
    }
}