using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ResourceTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResourceTypes", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Resources",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ResourceTypeId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resources", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Resources_ResourceTypes_ResourceTypeId",
                        column: x => x.ResourceTypeId,
                        principalTable: "ResourceTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ResourceId = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_Resources_ResourceId",
                        column: x => x.ResourceId,
                        principalTable: "Resources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "ResourceTypes",
                columns: new[] { "Id", "CreatedAt", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 9, 9, 11, 34, 44, 728, DateTimeKind.Local).AddTicks(9270), "Dropin-skrivbord" },
                    { 2, new DateTime(2025, 9, 9, 11, 34, 44, 728, DateTimeKind.Local).AddTicks(9570), "Mötesrum" },
                    { 3, new DateTime(2025, 9, 9, 11, 34, 44, 728, DateTimeKind.Local).AddTicks(9580), "VR-headset" },
                    { 4, new DateTime(2025, 9, 9, 11, 34, 44, 728, DateTimeKind.Local).AddTicks(9580), "AI-server" }
                });

            migrationBuilder.InsertData(
                table: "Resources",
                columns: new[] { "Id", "CreatedAt", "Name", "ResourceTypeId" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 9, 9, 11, 34, 44, 729, DateTimeKind.Local).AddTicks(1740), "Skrivbord 1", 1 },
                    { 2, new DateTime(2025, 9, 9, 11, 34, 44, 729, DateTimeKind.Local).AddTicks(2050), "Skrivbord 2", 1 },
                    { 3, new DateTime(2025, 9, 9, 11, 34, 44, 729, DateTimeKind.Local).AddTicks(2050), "Mötesrum 1", 2 },
                    { 4, new DateTime(2025, 9, 9, 11, 34, 44, 729, DateTimeKind.Local).AddTicks(2050), "Mötesrum 2", 2 },
                    { 5, new DateTime(2025, 9, 9, 11, 34, 44, 729, DateTimeKind.Local).AddTicks(2050), "VR-glasögon 1", 3 },
                    { 6, new DateTime(2025, 9, 9, 11, 34, 44, 729, DateTimeKind.Local).AddTicks(2050), "AI-server 1", 4 }
                });

            migrationBuilder.InsertData(
                table: "Bookings",
                columns: new[] { "Id", "CreatedAt", "EndTime", "ResourceId", "StartTime", "Status", "UserId" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 9, 9, 11, 34, 44, 729, DateTimeKind.Local).AddTicks(2250), new DateTime(2025, 9, 9, 13, 34, 44, 729, DateTimeKind.Local).AddTicks(2700), 1, new DateTime(2025, 9, 9, 12, 34, 44, 729, DateTimeKind.Local).AddTicks(2570), "Confirmed", new Guid("11111111-1111-1111-1111-111111111111") },
                    { 2, new DateTime(2025, 9, 9, 11, 34, 44, 729, DateTimeKind.Local).AddTicks(2890), new DateTime(2025, 9, 9, 15, 34, 44, 729, DateTimeKind.Local).AddTicks(2900), 3, new DateTime(2025, 9, 9, 14, 34, 44, 729, DateTimeKind.Local).AddTicks(2890), "Confirmed", new Guid("22222222-2222-2222-2222-222222222222") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ResourceId",
                table: "Bookings",
                column: "ResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_Resources_ResourceTypeId",
                table: "Resources",
                column: "ResourceTypeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "Resources");

            migrationBuilder.DropTable(
                name: "ResourceTypes");
        }
    }
}
