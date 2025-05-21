<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MedicalAllowancesModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'medical_allowances';

    protected $fillable = [
        'user_id',
        'amount',
    ];

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }
}
