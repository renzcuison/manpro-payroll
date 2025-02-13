<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class LeaveCreditsModel extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'leave_credits';

    protected $primaryKey = 'id';

    protected $fillable = [
        'client_id',
        'user_id',
        'application_type_id',
        'number',
        'used'
    ];

    public function type()
    {
        return $this->belongsTo(ApplicationTypesModel::class, 'application_type_id');
    }
}
