<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserIpModel extends Model
{
    use HasFactory;

    protected $table = 'user_ips';

    protected $fillable = [
        'user_id',
        'ip_address',
        'verified_by',
        'verified_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
