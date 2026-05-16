using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CodeFirst.Migrations
{
    /// <inheritdoc />
    public partial class InitialUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // הוספת עמודת Embedding בלבד
            migrationBuilder.AddColumn<string>(
                name: "Embedding",
                table: "Categories",
                type: "nvarchar(max)",
                nullable: true); // אפשר לשים nullable:true כדי לא להפריע לרשומות קיימות
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // הסרת העמודה במקרה של Rollback
            migrationBuilder.DropColumn(
                name: "Embedding",
                table: "Categories");
        }

    }
}
