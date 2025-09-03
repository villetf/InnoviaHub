using System;
using backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

public class AppDbContext : DbContext
{
   public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
   {
      Database.EnsureCreated();
   }

   public DbSet<Resource> Resources { get; set; }
   public DbSet<ResourceType> ResourceTypes { get; set; }
   public DbSet<Booking> Bookings { get; set; }

   protected override void OnModelCreating(ModelBuilder modelBuilder)
   {
      base.OnModelCreating(modelBuilder);

      modelBuilder.Entity<Booking>()
         .HasOne(b => b.Resource)
         .WithMany()
         .HasForeignKey(b => b.ResourceId);

      modelBuilder.Entity<Resource>()
         .HasOne(r => r.ResourceType)
         .WithMany()
         .HasForeignKey(r => r.ResourceTypeId);

      modelBuilder.Entity<ResourceType>().HasData(
         new ResourceType { Id = 1, Name = "Dropin-skrivbord" },
         new ResourceType { Id = 2, Name = "Mötesrum" },
         new ResourceType { Id = 3, Name = "VR-headset" },
         new ResourceType { Id = 4, Name = "AI-server" }
      );

      modelBuilder.Entity<Resource>().HasData(
         new Resource { Id = 1, Name = "Skrivbord 1", ResourceTypeId = 1 },
         new Resource { Id = 2, Name = "Skrivbord 2", ResourceTypeId = 1 },
         new Resource { Id = 3, Name = "Mötesrum 1", ResourceTypeId = 2 },
         new Resource { Id = 4, Name = "Mötesrum 2", ResourceTypeId = 2 },
         new Resource { Id = 5, Name = "VR-glasögon 1", ResourceTypeId = 3 },
         new Resource { Id = 6, Name = "AI-server 1", ResourceTypeId = 4 }
      );

      modelBuilder.Entity<Booking>().HasData(
         new Booking
         {
            Id = 1,
            UserId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            ResourceId = 1,
            StartTime = DateTime.Now.AddHours(1),
            EndTime = DateTime.Now.AddHours(2),
            Status = "Confirmed"
         },
         new Booking
         {
            Id = 2,
            UserId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            ResourceId = 3,
            StartTime = DateTime.Now.AddHours(3),
            EndTime = DateTime.Now.AddHours(4),
            Status = "Confirmed"
         }
      );
   }
}
