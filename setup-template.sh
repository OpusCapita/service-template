proceed='n'

function doReplace
{
    sed -i .bak -e "s/{{your-service-name}}/$name/g
          s/{{your-port}}/$port/g
          s/{{your-service-port}}/$port/g
          s/{{service-description}}/$description/g
          s/{{your-name}}/$author/g
          s/{{maintainer}}/$maintainer/g" $1
}

while [ $proceed != "y" ]; do
    echo -n "Service name: "
    read name

    echo -n "Service TCP port: "
    read port

    echo -n "Description: "
    read description

    echo -n "Author: "
    read author

    echo -n "Docker maintainer: "
    read maintainer

    echo -e "\n---------------------------\n"
    echo "Service name: ${name}"
    echo "Service TCP port: ${port}"
    echo "Description: ${description}"
    echo "Author: ${author}"
    echo "Docker maintainer: ${maintainer}"
    echo -e "\n";
    echo -n "This this correct? (y/n): "
    read proceed
done

doReplace 'package.json'
doReplace 'Dockerfile'
doReplace 'docker-compose.yml'
doReplace 'docker-compose.override.yml'
doReplace 'docker-compose.ci.yml'
doReplace 'src/server/index.js'
doReplace 'local/index.js'
doReplace 'local/index.html'
doReplace 'setup-consul.sh'
doReplace 'task_template.json'
doReplace '.env'
