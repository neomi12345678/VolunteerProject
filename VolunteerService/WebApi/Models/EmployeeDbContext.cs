using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace VolunteerService.Models;

public partial class EmployeeDbContext : DbContext
{
    public EmployeeDbContext()
    {
    }

    public EmployeeDbContext(DbContextOptions<EmployeeDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<CustomerTbl> CustomerTbls { get; set; }

    public virtual DbSet<EmployeeSalaryTbl> EmployeeSalaryTbls { get; set; }

    public virtual DbSet<EmployeeTbl> EmployeeTbls { get; set; }

    public virtual DbSet<Historyorder> Historyorders { get; set; }

    public virtual DbSet<OrdersTbl> OrdersTbls { get; set; }

    public virtual DbSet<Ordershystory> Ordershystories { get; set; }

    public virtual DbSet<ProductsTbl> ProductsTbls { get; set; }

    public virtual DbSet<TestEmployee> TestEmployees { get; set; }

    public virtual DbSet<V11> V11s { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("server=sql;database=EmployeeDB;trusted_connection=true;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CustomerTbl>(entity =>
        {
            entity.HasKey(e => e.CustId);

            entity.ToTable("Customer_tbl");

            entity.Property(e => e.CustId).HasColumnName("CustID");
            entity.Property(e => e.CustAddress)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.CustCity)
                .HasMaxLength(15)
                .IsUnicode(false);
            entity.Property(e => e.CustFax)
                .HasMaxLength(15)
                .IsUnicode(false);
            entity.Property(e => e.CustName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.CustPhone)
                .HasMaxLength(15)
                .IsUnicode(false);
            entity.Property(e => e.EmpId)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasColumnName("EmpID");
            entity.Property(e => e.LastUpDatee4x311r).HasColumnName("lastUpDatee4x311r");
            entity.Property(e => e.LastUpdate123).HasColumnName("lastUpdate123");
            entity.Property(e => e.ManagerId).HasColumnName("ManagerID");

            entity.HasOne(d => d.Emp).WithMany(p => p.CustomerTbls)
                .HasForeignKey(d => d.EmpId)
                .HasConstraintName("FK_Customer_tbl_Employee_tbl");
        });

        modelBuilder.Entity<EmployeeSalaryTbl>(entity =>
        {
            entity.HasKey(e => new { e.EmpId, e.PeriodDate });

            entity.ToTable("EmployeeSalary_tbl");

            entity.Property(e => e.EmpId)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasColumnName("EmpID");
            entity.Property(e => e.LastUpDatee4x311r).HasColumnName("lastUpDatee4x311r");
            entity.Property(e => e.LastUpdate123).HasColumnName("lastUpdate123");

            entity.HasOne(d => d.Emp).WithMany(p => p.EmployeeSalaryTbls)
                .HasForeignKey(d => d.EmpId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_EmployeeID");
        });

        modelBuilder.Entity<EmployeeTbl>(entity =>
        {
            entity.HasKey(e => e.EmpId);

            entity.ToTable("Employee_tbl");

            entity.Property(e => e.EmpId)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasColumnName("EmpID");
            entity.Property(e => e.Address)
                .HasMaxLength(25)
                .IsUnicode(false);
            entity.Property(e => e.City)
                .HasMaxLength(25)
                .IsUnicode(false);
            entity.Property(e => e.FirstName)
                .HasMaxLength(25)
                .IsUnicode(false);
            entity.Property(e => e.LastName)
                .HasMaxLength(25)
                .IsUnicode(false);
            entity.Property(e => e.LastUpDatee4x311r).HasColumnName("lastUpDatee4x311r");
            entity.Property(e => e.LastUpdate123).HasColumnName("lastUpdate123");
            entity.Property(e => e.Phone)
                .HasMaxLength(15)
                .IsUnicode(false);
            entity.Property(e => e.Zip)
                .HasMaxLength(5)
                .IsUnicode(false)
                .IsFixedLength();
        });

        modelBuilder.Entity<Historyorder>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("historyorder");

            entity.Property(e => e.Custid).HasColumnName("custid");
            entity.Property(e => e.DateDelteted)
                .HasColumnType("datetime")
                .HasColumnName("dateDelteted");
            entity.Property(e => e.Historyorderid).HasColumnName("historyorderid");
            entity.Property(e => e.LastUpDatee4x311r).HasColumnName("lastUpDatee4x311r");
            entity.Property(e => e.LastUpdate123).HasColumnName("lastUpdate123");
            entity.Property(e => e.LastUpdate2122).HasColumnName("lastUpdate2122");
            entity.Property(e => e.Prodid).HasColumnName("prodid");
            entity.Property(e => e.Qty).HasColumnName("qty");
        });

        modelBuilder.Entity<OrdersTbl>(entity =>
        {
            entity.HasKey(e => e.Ordnum);

            entity.ToTable("Orders_tbl", tb => tb.HasTrigger("tx"));

            entity.Property(e => e.CustId).HasColumnName("CustID");
            entity.Property(e => e.LastUpDatee4x311r).HasColumnName("lastUpDatee4x311r");
            entity.Property(e => e.LastUpdate123).HasColumnName("lastUpdate123");
            entity.Property(e => e.ProdId).HasColumnName("ProdID");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.Stutus).HasColumnName("STUTUS");

            entity.HasOne(d => d.Cust).WithMany(p => p.OrdersTbls)
                .HasForeignKey(d => d.CustId)
                .HasConstraintName("FK_Orders_tbl_Customer_tbl");

            entity.HasOne(d => d.Prod).WithMany(p => p.OrdersTbls)
                .HasForeignKey(d => d.ProdId)
                .HasConstraintName("FK_Orders_tbl_Products_tbl");
        });

        modelBuilder.Entity<Ordershystory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ordershy__3214EC27A4D27491");

            entity.ToTable("ordershystory");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Custid).HasColumnName("custid");
            entity.Property(e => e.DateDelteted).HasColumnName("dateDelteted");
            entity.Property(e => e.LastUpDatee4x311r).HasColumnName("lastUpDatee4x311r");
            entity.Property(e => e.LastUpdate123).HasColumnName("lastUpdate123");
            entity.Property(e => e.Prodid).HasColumnName("prodid");
            entity.Property(e => e.Qty).HasColumnName("qty");
        });

        modelBuilder.Entity<ProductsTbl>(entity =>
        {
            entity.HasKey(e => e.ProdId);

            entity.ToTable("Products_tbl");

            entity.Property(e => e.ProdId).HasColumnName("ProdID");
            entity.Property(e => e.LastUpDatee4x311r).HasColumnName("lastUpDatee4x311r");
            entity.Property(e => e.LastUpdate123).HasColumnName("lastUpdate123");
            entity.Property(e => e.ProdDesc)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<TestEmployee>(entity =>
        {
            entity.HasKey(e => e.EmpId).HasName("PK__test_emp__AF2DBB99BECAC4E0");

            entity.ToTable("test_employee");

            entity.Property(e => e.EmpId).ValueGeneratedNever();
            entity.Property(e => e.FirstName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.LastName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.LastUpDatee4x311r).HasColumnName("lastUpDatee4x311r");
            entity.Property(e => e.LastUpdate123).HasColumnName("lastUpdate123");
            entity.Property(e => e.Salary)
                .HasDefaultValue(6500m)
                .HasColumnType("money");
        });

        modelBuilder.Entity<V11>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("v11");

            entity.Property(e => e.CustAddress)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.CustCity)
                .HasMaxLength(15)
                .IsUnicode(false);
            entity.Property(e => e.CustFax)
                .HasMaxLength(15)
                .IsUnicode(false);
            entity.Property(e => e.CustId).HasColumnName("CustID");
            entity.Property(e => e.CustName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.CustPhone)
                .HasMaxLength(15)
                .IsUnicode(false);
            entity.Property(e => e.EmpId)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasColumnName("EmpID");
            entity.Property(e => e.LastUpDatee4x311r).HasColumnName("lastUpDatee4x311r");
            entity.Property(e => e.LastUpdate123).HasColumnName("lastUpdate123");
            entity.Property(e => e.ManagerId).HasColumnName("ManagerID");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
