using System;
using System.Collections.Generic;

namespace VolunteerService.Models;

public partial class OrdersTbl
{
    public int Ordnum { get; set; }

    public int? CustId { get; set; }

    public int? ProdId { get; set; }

    public int? Qty { get; set; }

    public DateOnly? OrdDate { get; set; }

    public int? Stutus { get; set; }

    public int? Status { get; set; }

    public DateOnly? LastUpdate123 { get; set; }

    public DateOnly? LastUpDatee4x311r { get; set; }

    public virtual CustomerTbl? Cust { get; set; }

    public virtual ProductsTbl? Prod { get; set; }
}
