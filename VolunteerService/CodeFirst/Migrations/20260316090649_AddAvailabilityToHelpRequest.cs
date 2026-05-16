using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CodeFirst.Migrations
{
    /// <inheritdoc />
    public partial class AddAvailabilityToHelpRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "HelpRequests");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "HelpRequests");

            migrationBuilder.AddColumn<int>(
                name: "AvailabilityId",
                table: "HelpRequests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_HelpRequests_AvailabilityId",
                table: "HelpRequests",
                column: "AvailabilityId");

            migrationBuilder.AddForeignKey(
                name: "FK_HelpRequests_Availabilities_AvailabilityId",
                table: "HelpRequests",
                column: "AvailabilityId",
                principalTable: "Availabilities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HelpRequests_Availabilities_AvailabilityId",
                table: "HelpRequests");

            migrationBuilder.DropIndex(
                name: "IX_HelpRequests_AvailabilityId",
                table: "HelpRequests");

            migrationBuilder.DropColumn(
                name: "AvailabilityId",
                table: "HelpRequests");

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Users",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Users",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "HelpRequests",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "HelpRequests",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }
    }
}
