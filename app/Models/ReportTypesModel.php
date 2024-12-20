<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportTypesModel extends Model
{
    use HasFactory;

    protected $table = 'report_types';

    protected $primaryKey = 'id';

    protected $fillable = [
        'client_id',
        'team',
        'type_name',
        'created_by',
        'is_deleted',
        'deleted_by',
        'created_at',
        'updated_at',
    ];
}
