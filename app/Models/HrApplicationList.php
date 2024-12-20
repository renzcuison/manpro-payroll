<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrApplicationList extends Model
{
    use HasFactory;

    protected $table = 'hr_application_list';

    protected $primaryKey = 'applist_id';

    protected $fillable = [
        'list_name',
        'percentage',
        'date_created',
        'is_deleted',
        'team',
    ];
}
