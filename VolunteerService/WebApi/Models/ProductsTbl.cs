using System;
using System.Collections.Generic;

namespace VolunteerService.Models;

public partial class ProductsTbl
{
    public int ProdId { get; set; }

    public string ProdDesc { get; set; } = null!;

    public double Cost { get; set; }

    public DateOnly? LastUpdate123 { get; set; }

    public DateOnly? LastUpDatee4x311r { get; set; }

    public virtual ICollection<OrdersTbl> OrdersTbls { get; set; } = new List<OrdersTbl>();
}
