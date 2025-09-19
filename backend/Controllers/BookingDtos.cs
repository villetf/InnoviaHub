namespace backend.Controllers;


public record BookingCreateDto(Guid UserId, string? UserName, int ResourceId, DateTime StartTime, DateTime EndTime, string Status);
public record BookingUpdateDto(Guid UserId, string? UserName, int ResourceId, DateTime StartTime, DateTime EndTime, string Status);
public record BookingReadDto(int Id, Guid UserId, string? UserName, int ResourceId, string ResourceName, DateTime StartTime, DateTime EndTime, string Status, DateTime CreatedAt);
