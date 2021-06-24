# AirBit IoT Workspace datasource for Grafana
The plugin integrates with the AirBit Workspace datasource for Grafana.

## Installation / Uninstallation
### Install on Ubuntu Linux
To install this plugin using the grafana-cli tool:
```shell
sudo grafana-cli --pluginUrl https://github.com/Danburit/AirBitIoTWorkspace/releases/download/v0.2.5/airbit-workspace-datasource.zip plugins install airbit-workspace-datasource
sudo /bin/systemctl restart grafana-server
```
### Uninstall on Ubuntu Linux
To uninstall this plugin using the grafana-cli tool:
```shell
sudo grafana-cli plugins uninstall airbit-workspace-datasource
sudo /bin/systemctl restart grafana-server
```
See [here](https://grafana.com/docs/grafana/latest/administration/cli/) for more information.

## To configure datasource
When adding a data source, add the API endpoint to the `URL` field. This is where the data source will make queries to. Switch `Basic auth` and fill the `User` and `Password` fields. 

![Datasource setup](https://raw.githubusercontent.com/Danburit/AirBitIoTWorkspace/master/docs/image/datasource-setup.png)