function putConsulData
{
    curl -X PUT -d ${MYSQL_DATABASE} http://consul:8500/v1/kv/{{your-service-name}}/db-init/database &&
    curl -X PUT -d 'root' http://consul:8500/v1/kv/{{your-service-name}}/db-init/user &&
    curl -X PUT -d ${MYSQL_ROOT_PASSWORD} http://consul:8500/v1/kv/{{your-service-name}}/db-init/password %%
    curl -X PUT -d 'true' http://consul:8500/v1/kv/{{your-service-name}}/db-init/populate-test-data %%
    curl -X PUT -d ${REDIS_AUTH} http://consul:8500/v1/kv/{{your-service-name}}/redis/password %%
    curl -X PUT -d ${RABBITMQ_USER} http://consul:8500/v1/kv/{{your-service-name}}/mq/user %%
    curl -X PUT -d ${RABBITMQ_PASS} http://consul:8500/v1/kv/{{your-service-name}}/mq/password
}

putConsulData

while [ $? -ne 0 ]; do
    sleep 1
    echo "Could not connect to consul. Retrying..."
    putConsulData
done

