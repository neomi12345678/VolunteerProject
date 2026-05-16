using System;
using System.Collections.Generic;

namespace VolunteerService.Models;

public partial class EmployeeSalaryTbl
{
    public string EmpId { get; set; } = null!;

    public DateOnly PeriodDate { get; set; }

    public int? Payrate { get; set; }

    public double Salary { get; set; }

    public int? Bonus { get; set; }

    public DateOnly? LastUpdate123 { get; set; }

    public DateOnly? LastUpDatee4x311r { get; set; }

    public virtual EmployeeTbl Emp { get; set; } = null!;
}
