# Use the official PostgreSQL image as the base
FROM postgres:12

# Copy custom configuration files into the container
COPY ./postgresql.conf /var/lib/postgresql/data/postgresql.conf
COPY ./pg_hba.conf /var/lib/postgresql/data/pg_hba.conf

# Adjust permissions for our custom config files
RUN chown postgres:postgres /var/lib/postgresql/data/postgresql.conf
RUN chown postgres:postgres /var/lib/postgresql/data/pg_hba.conf

# Expose the default PostgreSQL port
EXPOSE 5432

# The base image already has a CMD instruction to run PostgreSQL, so we don't need to specify it again
