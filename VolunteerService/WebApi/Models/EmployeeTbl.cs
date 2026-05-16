using System;
using System.Collections.Generic;

namespace VolunteerService.Models;

public partial class EmployeeTbl
{
    public string EmpId { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string? FirstName { get; set; }

    public string? Zip { get; set; }

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public string? City { get; set; }

    public int? Position { get; set; }

    public DateOnly? DateHire { get; set; }

    public DateOnly? LastUpdate123 { get; set; }

    public DateOnly? LastUpDatee4x311r { get; set; }

    public virtual ICollection<CustomerTbl> CustomerTbls { get; set; } = new List<CustomerTbl>();

    public virtual ICollection<EmployeeSalaryTbl> EmployeeSalaryTbls { get; set; } = new List<EmployeeSalaryTbl>();
}
