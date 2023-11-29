export const logForwardingEntrySchema = `
            id
            tenantEntryId
            serviceType
            status
            tagList
            lastProcessedTime
            lastFailedSendingTime
            lastFailedMessage
            successCount
            failureCount
            azureSentinel{
                CustomerId
                SharedKey
            }
            name
            logFormat
            connectionType
            networkType
            networkId
            serverAddr
            serverStatus
            port
            createdAt
            updatedAt
            enable
            `;
export const sshRuleSchema = `
            id
            name
            groups
            users
            tenantId
            sshAuthMethod
            sshUserName
            deriveUsernameFromEmail
            sshcaID
            offline
            certificateLifetime
            createdAt
            updatedAt
`;
export const sshProfileSchema = `
      id
      name
      tenantId
      rules {
        items {
          rule {
            id
            name
            groups
            users
            sshAuthMethod
            sshUserName
            deriveUsernameFromEmail
            createdAt
          }
        }
      }
      apps {
        items {
          resname
        }
        nextToken
      }
`;
export const generateSshKeySchema = `
mutation GenerateSshKey($input: GenerateSshKeyInput!) {
  generateSshKey(input: $input) {
    algorithm
    publicKey
  }
}
`;
export const sshProfileRuleSchema = `
id
          id
          profile {
            id
            name
            tenantId
            rules {
              nextToken
            }
            apps {
              nextToken
            }
            createdAt
            updatedAt
          }
          rule {
            id
            name
            groups
            users
            tenantId
            sshAuthMethod
            sshUserName
            deriveUsernameFromEmail
            sshcaID
            offline
            certificateLifetime
            key {
              id
              name
              user
              sshKeyEntryTenantId
              gcpKeyIndex
              isShared
              description
              publicKey
              algorithm
              createdAt
              updatedAt
            }
            profiles {
              nextToken
            }
            createdAt
            updatedAt
          }
      `;
export const sshKeySchema = `
mutation CreateSshKeyEntry(
  $input: InsertSshKeyEntryInput!
) {
  insertSshKeyEntry(input: $input) {
          id
          name
          user
          gcpKeyIndex
          isShared
          description
          publicKey
          algorithm
          rules {
            items {
              id
              name
              groups
              users
              tenantId
              sshAuthMethod
              sshUserName
              deriveUsernameFromEmail
              sshcaID
              offline
              certificateLifetime
              createdAt
              updatedAt
            }
            nextToken
          }
          createdAt
          updatedAt
        }
      }`        
          export const deleteLauncherSchema = `
          id
          resourcetype
          resourceEntryTenantId
          tenant {
            id
            domain
            networks {
              nextToken
            }
            gcpconnectors {
              nextToken
            }
            createdby
            groups
            webClientId
            idpDomain
            idpProvider {
              type
              name
              displayName
              iconUrl
              defaultRoleId
              enabled
              oktaDomainUrl
              samlMetaDataID
              advanced
            }
            tenanttype
            name
            description
            createdAt
            firstLogin
            acountApiUsername
            acountApiPassword
            certificateAuthorities {
              id
              caName
              caType
              privateKeyValue
              publicKeyValue
              certificateValue
              validTTL
              subject
              cryptoInfo
              createdAt
              updatedAt
            }
            keymanagements {
              id
              kmsName
              kmsType
              networkID
              hiddenResourceID
              vaultHost
              vaultRoleID
              vaultSecretID
              vaultLoginPath
              vaultSignPath
              vaultSignHostCAPath
              vaultDatabaseCredentialPath
              vaultNamespace
              vaultEnableDyn
              vaultTriggerDynPath
              vaultTriggerDynKey
              vaultTriggerDynAccount
              vaultDynScript
              vaultServerConnectionStatus
              vaultServerVersion
              vaultClusterName
              azureKeyAlg
              azureActiveAt
              azureExpireAt
              awsCredentialId
              awsRegion
              createdAt
              updatedAt
            }
            webhookConfigs {
              nextToken
            }
            privacyNoticesLink
            termOfUseLink
            sku {
              createdAt
              updatedAt
              skuType
              name
              capacity
            }
            paidUserQuota
            paidSubscriptionStartAt
            idleTimeout
            vpnCidr
            vpnServerIp
            vpnDns
            enableVpn
            azureConnector {
              tenantId
              clientId
              crt
              key
              fingerprint
            }
            azureKeyVaults
            sessRecordingExpire
            magicLinkDuration
            syncAzureApps
            syncAzureTime
            disableSyncAzure
            syncOktaApps
            syncOktaTime
            disableSyncOkta
            oktaAPIToken
            updatedAt
          }
          resname
          description
          iconUrl
          isolation
          gcpfilter {
            project
            vpcname
            instance
            networktags
          }
          network {
            id
            AgentToken
            vpcid
            nwcidr
            vpnRoutes
            networkTag
            networkEntryTenantId
            name
            tenant {
              id
              domain
              createdby
              groups
              webClientId
              idpDomain
              tenanttype
              name
              description
              createdAt
              firstLogin
              acountApiUsername
              acountApiPassword
              privacyNoticesLink
              termOfUseLink
              paidUserQuota
              paidSubscriptionStartAt
              idleTimeout
              vpnCidr
              vpnServerIp
              vpnDns
              enableVpn
              azureKeyVaults
              sessRecordingExpire
              magicLinkDuration
              syncAzureApps
              syncAzureTime
              disableSyncAzure
              syncOktaApps
              syncOktaTime
              disableSyncOkta
              oktaAPIToken
              updatedAt
            }
            resource {
              nextToken
            }
            serviceedge {
              nextToken
            }
            activeServiceEdges {
              nextToken
            }
            devicemgmt
            description
            proxyConfig {
              proxyAddr
              username
              password
            }
            createdAt
            updatedAt
            validationCode
            networkType
          }
          resourceEntryNetworkId
          appsetting {
            appprotocol
            apphost
            appport
            localport
            sshUserName
            sshPrivateKey
            sshAuthMethod
            appinternalurl
            targetprotocol
            source
            azureAppId
            dbName
            vaultServerId
            offline
            certificateLifetime
          }
          status
          policy {
            id
            name
            policyEntryTenantId
            rules {
              nextToken
            }
            resources {
              nextToken
            }
            default
            createdAt
            updatedAt
          }
          passwordVaultingAssignmentType
          samlProxyEnabled
          samlProxyToAppMetadata
          samlProxyToIdPMetadata
          samlProxyExtraSetting {
            customizedRelayState
            attributeMappingList {
              attributeName
              attributeValue
            }
          }
          samlProxyToAppPrivateKey
          samlProxyToAppCertificate
          samlProxyFromAppEntityID
          samlProxyFromAppACSURL
          samlProxyToAppEntityID
          samlProxyToAppSSOURL
          samlProxyFromAppCertificate
          samlProxyToIdPEntityID
          samlProxyToIdPACSURL
          samlProxyFromIdPEntityID
          samlProxyFromIdPSSOURL
          samlProxyFromIdPCertificate
          sshcaID
          deriveUsernameFromEmail
          sshAuthProfileId
          sshAuthProfile {
            id
            name
            tenantId
            rules {
              nextToken
            }
            apps {
              nextToken
            }
            createdAt
            updatedAt
          }
          sshProfile {
            id
            sshProfileTenantId
            name
            actions {
              id
              priority
              roles
              enableProvision
              groups
              dynScript
            }
            createdAt
            updatedAt
            resource {
              nextToken
            }
          }
          oktaID
          kubeGroup
          aclEntryId
          acl {
            id
            tenantEntryId
            name
            aclDetails {
              nextToken
            }
            createdAt
            updatedAt
          }
          monitorPolicyEntryId
          monitorPolicy {
            id
            name
            tenantEntryId
            rules {
              nextToken
            }
            resources {
              nextToken
            }
            createdAt
            updatedAt
          }
          allowedUrls
          enableRecording
          allowSharing
          hostKeyVerification
          hostKeyCA
          connectStatus
          latency
          waterMarkEnabled
          waterMarkText
          incognito
          category
          createdAt
          updatedAt
          `;
          export const networkSchema = `
          id
          name
          AgentToken
          vpcid
          nwcidr
          networkTag
          networkType
          tenant {
          id
          domain
          createdby
          }
          resource {
          items {
              id
              resourcetype
              resourceEntryTenantId
              resname
              iconUrl
              description
              status
              category
          }
          nextToken
          }
          activeServiceEdges {
          items {
              id
              serviceEdgeId
              createdAt
              region
              version
              latencies
              metadata {
              hostname
              cloud
              cpuinfo
              kernel
              cpus
              publicip
              isK8s
              memory
              semip
              }
          }
          nextToken
          }
          serviceedge {
          items {
              id
              name
              dynentry
              description
              latestVersion
              clientver
              svcStatus {
              hostname
              privateip
              az
              vpcid
              subnetid
              subnet
              publicip
              semcloud
              semregion
              }
              dmStatus {
              serialno
              hostname
              privateip
              gateway
              dnsserver
              dhcpserver
              publicip
              label
              semcloud
              semregion
              }
              authSecret
              serviceEdgeType
              updatedAt
              deviceLabel
          }
          nextToken
          }
          description
          devicemgmt
          createdAt
          updatedAt
          validationCode
          networkType
          proxyConfig {
          proxyAddr
          username
          password
          }`;
          export const listLaunchableAppsSchema = `
          items {
            id
            acl {
              aclDetails {
                items {
                  id
                  ips
                  hosts
                  userEntryId
                }
              }
            }
            aclEntryId
            monitorPolicyEntryId
            monitorPolicy {
              id
              name
              rules {
                items {
                  id
                  name
                  eventTypes
                  condition {
                    frequencyValue
                    frequencyRate
                    locations
                    locationFilterType
                  }
                  action {
                    alertLevel
                    accessControl
                    accessControlType
                    notifyUser
                  }
                  ruleRoleLinks {
                    items {
                      roleId
                    }
                  }
                }
              }
            }
            resourcetype
            resourceEntryTenantId
            tenant {
              id
              domain
              createdby
              groups
              webClientId
              idpDomain
              tenanttype
              name
              description
            }
            resname
            kubeGroup
            enableRecording
            allowSharing
            description
            iconUrl
            isolation
            gcpfilter {
              project
              vpcname
              instance
              networktags
            }
            network {
              id
              AgentToken
              vpcid
              nwcidr
              networkTag
              name
              devicemgmt
              description
              createdAt
              updatedAt
              serviceedge {
                items {
                  id
                  dynentry
                  name
                  description
                  updatedAt
                  svcStatus {
                    hostname
                    privateip
                    az
                    vpcid
                    subnetid
                    subnet
                    publicip
                    semcloud
                    semregion
                  }
                  dmStatus {
                    serialno
                    hostname
                    privateip
                    gateway
                    dnsserver
                    dhcpserver
                    publicip
                    label
                    semcloud
                    semregion
                  }
                }
                nextToken
              }
              createdAt
              updatedAt
              __typename
            }
            appsetting {
              appprotocol
              apphost
              appport
              localport
              sshUserName
              sshPrivateKey
              appinternalurl
              targetprotocol
              offline
              certificateLifetime
              sshAuthMethod
              dbName
              vaultServerId
              azureAppId
              source
            }
            allowedUrls
            status
            policy {
              id
              name
              policyEntryTenantId
              default
              rules {
                items {
                  actions
                  roles {
                    items {
                      role {
                        id
                        name
                      }
                    }
                  }
                }
              }
              createdAt
              updatedAt
            }
            passwordVaultingAssignmentType
            category
            createdAt
            updatedAt
            samlProxyEnabled
            samlProxyToAppMetadata
            samlProxyToIdPMetadata
            samlProxyExtraSetting {
              customizedRelayState
              attributeMappingList {
                attributeName
                attributeValue
              }
            }
            samlProxyToAppCertificate
            samlProxyFromAppEntityID
            samlProxyFromAppACSURL
            samlProxyToAppEntityID
            samlProxyToAppSSOURL
            samlProxyToIdPEntityID
            samlProxyToIdPACSURL
            samlProxyFromIdPEntityID
            samlProxyFromIdPSSOURL
            samlProxyFromIdPCertificate
            sshcaID
            hostKeyVerification
            hostKeyCA
            deriveUsernameFromEmail
            incognito
            sshAuthProfileId
            sshProfile {
              id
              sshProfileTenantId
              name
              createdAt
              updatedAt
            }
            oktaID
            connectStatus
            latency
            waterMarkEnabled
            waterMarkText
          }
          `