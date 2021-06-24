# AirBit IoT Workspace datasource for Grafana
This plugin based on [GrafanaJsonDatasource](https://github.com/simPod/GrafanaJsonDatasource).

## Contents
- [Before you start](#before-you-start)
- [Install the plugin](#install-the-plugin)
    - [Install on Ubuntu Linux](#install-on-ubuntu-linux)
- [To configure datasource](#to-configure-datasource)
- [Uninstall the plugin](#uninstall-the-plugin)
    - [Uninstall on Ubuntu Linux](#uninstall-on-ubuntu-linux)
- [Development setup](#development-setup)

## Before you start

* plugin is unsigned 

To make the plugin work, add the airbit-iot-ws-datasource id to the parameter allow_loading_unsigned_plugins in the grafana.ini configuration.
```ini
...
[plugins]
allow_loading_unsigned_plugins = "airbit-iot-ws-datasource"
...
```

## Install the plugin
### Install on Ubuntu Linux
To install the plugin on Ubuntu Linux:
```shell
sudo grafana-cli --pluginUrl https://github.com/Danburit/AirBitIoTWorkspace/releases/download/v0.2.5/airbit-iot-ws-datasource.zip plugins install airbit-iot-ws-datasource
sudo /bin/systemctl restart grafana-server
```

## To configure datasource
When adding a data source, add the API endpoint to the `URL` field. This is where the data source will make queries to. Switch `Basic auth` and fill the `User` and `Password` fields. 

![Datasource setup](https://raw.githubusercontent.com/Danburit/AirBitIoTWorkspace/master/docs/image/datasource-setup.png)
## Uninstall the plugin
### Uninstall on Ubuntu Linux
To uninstall the plugin on Ubuntu Linux:
```shell
sudo grafana-cli plugins uninstall airbit-iot-ws-datasource
sudo /bin/systemctl restart grafana-server
```

## Development setup

```shell
yarn install
yarn run build
```