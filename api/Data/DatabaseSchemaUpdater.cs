using System.Data;
using Microsoft.EntityFrameworkCore;

namespace DebTecJourney.Api.Data;

public sealed class DatabaseSchemaUpdater(AppDbContext db)
{
    public async Task ApplyAsync(CancellationToken cancellationToken = default)
    {
        var connection = db.Database.GetDbConnection();
        var shouldClose = connection.State != ConnectionState.Open;

        if (shouldClose)
        {
            await connection.OpenAsync(cancellationToken);
        }

        try
        {
            var userColumns = await GetColumnsAsync(connection, "Users", cancellationToken);

            await AddColumnIfMissingAsync(connection, userColumns, "Users", "AcademicProfile", "TEXT NOT NULL DEFAULT ''", cancellationToken);
            await AddColumnIfMissingAsync(connection, userColumns, "Users", "ExperienceLevel", "TEXT NOT NULL DEFAULT ''", cancellationToken);
            await AddColumnIfMissingAsync(connection, userColumns, "Users", "LearningGoal", "TEXT NOT NULL DEFAULT ''", cancellationToken);
            await AddColumnIfMissingAsync(connection, userColumns, "Users", "DailyGoalMinutes", "INTEGER NOT NULL DEFAULT 10", cancellationToken);
        }
        finally
        {
            if (shouldClose)
            {
                await connection.CloseAsync();
            }
        }
    }

    private static async Task<HashSet<string>> GetColumnsAsync(
        System.Data.Common.DbConnection connection,
        string tableName,
        CancellationToken cancellationToken)
    {
        var columns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        await using var command = connection.CreateCommand();
        command.CommandText = $"PRAGMA table_info('{tableName}')";

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            columns.Add(reader.GetString(1));
        }

        return columns;
    }

    private static async Task AddColumnIfMissingAsync(
        System.Data.Common.DbConnection connection,
        HashSet<string> existingColumns,
        string tableName,
        string columnName,
        string columnDefinition,
        CancellationToken cancellationToken)
    {
        if (existingColumns.Contains(columnName))
        {
            return;
        }

        await using var command = connection.CreateCommand();
        command.CommandText = $"ALTER TABLE {tableName} ADD COLUMN {columnName} {columnDefinition}";
        await command.ExecuteNonQueryAsync(cancellationToken);
        existingColumns.Add(columnName);
    }
}
