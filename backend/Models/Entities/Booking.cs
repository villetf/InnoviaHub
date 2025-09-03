using System;
using backend.Models.Entities;

namespace backend.Models;

public class Booking
{
   public int Id { get; set; }
   public required Guid UserId { get; set; }
   public required int ResourceId { get; set; }
   public Resource? Resource { get; set; }
   public required DateTime StartTime { get; set; }
   public required DateTime EndTime { get; set; }
   public required string Status { get; set; }
   public DateTime CreatedAt { get; set; } = DateTime.Now;
}
